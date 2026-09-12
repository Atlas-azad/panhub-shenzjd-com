import { BaseAsyncPlugin } from "./manager";
import type { SearchResult, Link } from "../types/models";
import { ofetch } from "ofetch";

const PROXY_BASE = "https://xiaokupan-proxy.azad-sl.workers.dev";
const SEARCH_BASE_URL = "https://xiaokupan.com/s";
 
const SERVICE_MAP: Record<string, string> = {
  BAIDU: "baidu",
  XUNLEI: "xunlei",
  QUARK: "quark",
  ALIYUN: "aliyun",
  UC: "uc",
  TIANYI: "tianyi",
  MOBILE: "mobile",
  "115": "115",
  PIKPAK: "pikpak",
  "123": "123",
  MAGNET: "magnet",
  ED2K: "ed2k",
};
 
const DIGITAL_DOCUMENT_REGEX =
  /\\"@type\\":\\"DigitalDocument\\",\\"name\\":\\"((?:\\\\.|[^"\\])*)\\",\\"description\\":\\"((?:\\\\.|[^"\\])*)\\",\\"url\\":\\"((?:\\\\.|[^"\\])*)\\",\\"dateModified\\":\\"((?:\\\\.|[^"\\])*)\\"/g;
const STREAM_RESOURCE_REGEX =
  /\{url:"((?:\\.|[^"\\])*)",password:"((?:\\.|[^"\\])*)",note:"((?:\\.|[^"\\])*)"/g;
 
const SERVICE_PATTERNS: Array<{ service: string; pattern: RegExp }> = [
  { service: "BAIDU", pattern: /https?:\/\/pan\.baidu\.com\/s\/[A-Za-z0-9_-]+(?:\?pwd=[A-Za-z0-9]+)?/i },
  { service: "XUNLEI", pattern: /https?:\/\/pan\.xunlei\.com\/s\/[A-Za-z0-9_-]+(?:\?pwd=[A-Za-z0-9]+)?#?/i },
  { service: "QUARK", pattern: /https?:\/\/pan\.quark\.cn\/s\/[A-Za-z0-9]+/i },
  { service: "ALIYUN", pattern: /https?:\/\/(?:www\.)?(?:aliyundrive|alipan)\.com\/s\/[A-Za-z0-9]+/i },
  { service: "UC", pattern: /https?:\/\/drive\.uc\.cn\/s\/[A-Za-z0-9]+(?:\?public=1)?/i },
  { service: "TIANYI", pattern: /https?:\/\/cloud\.189\.cn\/(?:t\/|web\/share\?code=)[^"\\\s]+/i },
  { service: "MOBILE", pattern: /https?:\/\/(?:caiyun|yun)\.139\.com\/(?:m\/i\?|w\/i\/)[^"\\\s]+/i },
  { service: "115", pattern: /https?:\/\/115cdn\.com\/s\/[A-Za-z0-9]+(?:\?password=[A-Za-z0-9]+)?/i },
  { service: "PIKPAK", pattern: /https?:\/\/mypikpak\.com\/s\/[^"\\\s]+/i },
  { service: "123", pattern: /https?:\/\/(?:www\.)?(?:123684|123865|123912|123pan)\.(?:com|cn)\/s\/[^?"\\\s]+/i },
  { service: "MAGNET", pattern: /magnet:\?[^"\\\s]+/i },
  { service: "ED2K", pattern: /ed2k:\/\/[^"\\\s]+/i },
];
 
const DESCRIPTION_SERVICE_MAPPING: Record<string, string> = {
  baidu: "BAIDU",
  xunlei: "XUNLEI",
  quark: "QUARK",
  aliyun: "ALIYUN",
  uc: "UC",
  tianyi: "TIANYI",
  mobile: "MOBILE",
  "115": "115",
  pikpak: "PIKPAK",
  "123": "123",
  magnet: "MAGNET",
  ed2k: "ED2K",
};
 
interface XiaokupanDocument {
  name: string;
  description: string;
  url: string;
  password?: string;
}
 
function decodeJsonFragment(value: string): string {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value
      .replace(/\\u0026/g, "&")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
}
 
function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
 
function normalizeTitle(title: string): string {
  return normalizeWhitespace(title)
    .replace(/^资源名称[:：]\s*/i, "")
    .slice(0, 160)
    .trim();
}
 
function detectService(url: string, description: string): string {
  const serviceMatch = SERVICE_PATTERNS.find(({ pattern }) => pattern.test(url));
  if (serviceMatch) return serviceMatch.service;
 
  const descriptionLower = description.toLowerCase();
  const mappingEntry = Object.entries(DESCRIPTION_SERVICE_MAPPING).find(
    ([provider]) =>
      descriptionLower.includes(`来自${provider}网盘`) ||
      descriptionLower.includes(`${provider}网盘`)
  );
  return mappingEntry?.[1] || "OTHER";
}
 
function normalizeLink(rawUrl: string): string {
  const decodedUrl = decodeJsonFragment(rawUrl)
    .replace(/&amp;/g, "&")
    .trim();
  const matchedPattern = SERVICE_PATTERNS.find(({ pattern }) =>
    pattern.test(decodedUrl)
  );
  if (!matchedPattern) return decodedUrl.replace(/#$/, "");
  const matchedUrl = decodedUrl.match(matchedPattern.pattern)?.[0];
  return (matchedUrl || decodedUrl).replace(/#$/, "");
}
 
function extractPassword(rawUrl: string): string | undefined {
  const decodedUrl = decodeJsonFragment(rawUrl)
    .replace(/&amp;/g, "&")
    .trim();
  const queryPassword = decodedUrl.match(
    /[?&](?:pwd|password)=([A-Za-z0-9]+)/i
  )?.[1];
  if (queryPassword) return queryPassword;
  return decodedUrl.match(/提取码[:：]?([A-Za-z0-9]+)/)?.[1];
}
 
function extractDocuments(html: string): XiaokupanDocument[] {
  const documents: XiaokupanDocument[] = [];
  let match: RegExpExecArray | null;
 
  while ((match = DIGITAL_DOCUMENT_REGEX.exec(html)) !== null) {
    const name = normalizeTitle(decodeJsonFragment(match[1] || ""));
    const description = normalizeWhitespace(decodeJsonFragment(match[2] || ""));
    const url = decodeJsonFragment(match[3] || "").trim();
    if (!name || !url) continue;
    documents.push({ name, description, url });
  }
  return documents;
}
 
function extractStreamDocuments(html: string): XiaokupanDocument[] {
  const documents: XiaokupanDocument[] = [];
  for (const match of html.matchAll(STREAM_RESOURCE_REGEX)) {
    const url = decodeJsonFragment(match[1] || "").trim();
    const password = decodeJsonFragment(match[2] || "").trim();
    const note = normalizeTitle(decodeJsonFragment(match[3] || ""));
    if (!note || !url) continue;
    documents.push({ name: note, description: note, url, password: password || undefined });
  }
  return documents;
}
 
export class XiaokupanPlugin extends BaseAsyncPlugin {
  constructor() {
    super("xiaokupan", 3);
  }
 
  override async search(
    keyword: string,
    ext?: Record<string, any>
  ): Promise<SearchResult[]> {
    const timeout = Math.max(
      3000,
      Number((ext as any)?.__plugin_timeout_ms) || 6000
    );
    const kw = (keyword || "").trim();
    if (!kw) return [];
 
    let html = "";
    try {
        html = await ofetch<string>(
        `${PROXY_BASE}/?url=${encodeURIComponent(`${SEARCH_BASE_URL}/${encodeURIComponent(kw)}`)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            Referer: "https://xiaokupan.com/",
          },
          timeout,
        }
      );
    } catch {
      return [];
    }
 
    const documents = [
      ...extractDocuments(html),
      ...extractStreamDocuments(html),
    ];
 
    const results: SearchResult[] = [];
    const grouped = new Map<string, Link[]>();
 
    for (const doc of documents) {
      const link = normalizeLink(doc.url);
      if (!link) continue;
      const service = detectService(link, doc.description);
      const pwd = doc.password || extractPassword(doc.url) || "";
      const type = SERVICE_MAP[service] || "others";
      const existing = grouped.get(doc.name) || [];
      if (!existing.some((e) => e.url === link && e.password === pwd)) {
        existing.push({ type, url: link, password: pwd });
      }
      grouped.set(doc.name, existing);
    }
 
    let idx = 0;
    for (const [name, links] of grouped) {
      if (links.length === 0) continue;
      results.push({
        message_id: "",
        unique_id: `xiaokupan-${idx}-${links[0].url}`,
        channel: "",
        datetime: "",
        title: name,
        content: name,
        links,
      });
      idx++;
      if (idx >= 100) break;
    }
 
    return results;
  }
}
