import { BaseAsyncPlugin } from "./manager";
import type { SearchResult } from "../types/models";
import { fetchWithRetry } from "../utils/fetch";
 
/**
 * PanSou 在线 API 搜索插件
 * 接口: POST https://pansou.app/api/search  { kw, src, res }
 * 响应: { total, results: [{ unique_id, title, content, links, datetime, channel }] }
 */
 
const API = "https://pansou.app/api/search";
 
type PanSouLink = { type: string; url: string; password?: string };
type PanSouItem = {
  unique_id?: string;
  title?: string;
  content?: string;
  links?: PanSouLink[];
  datetime?: string;
  channel?: string;
};
type PanSouResp = { total?: number; results?: PanSouItem[] };
 
function mapType(t: string): string {
  const m: Record<string, string> = {
    baidu: "baidu", aliyun: "aliyun", quark: "quark",
    tianyi: "tianyi", uc: "uc", mobile: "mobile",
    "115": "115", pikpak: "pikpak", xunlei: "xunlei",
    "123": "123", magnet: "magnet", ed2k: "ed2k",
  };
  return m[t] || "others";
}
 
export class PansouApiPlugin extends BaseAsyncPlugin {
  constructor() {
    super("pansouApi", 2);
  }
 
  override async search(keyword: string): Promise<SearchResult[]> {
    const kw = (keyword || "").trim();
    if (!kw) return [];
 
    const resp = await fetchWithRetry<PanSouResp>(
      API,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: JSON.stringify({ kw, src: "all", res: "results" }),
      },
      { maxRetries: 1, timeout: 10000, logWarnings: false }
    ).catch(() => undefined);
 
    const items = resp?.results || [];
    const out: SearchResult[] = [];
 
    for (const item of items) {
      if (!Array.isArray(item.links) || item.links.length === 0) continue;
      const validLinks = item.links
        .filter((l) => l.url && !l.url.toLowerCase().startsWith("magnet:"))
        .map((l) => ({ type: mapType(l.type), url: l.url, password: l.password || "" }));
      if (validLinks.length === 0) continue;
 
      out.push({
        message_id: "",
        unique_id: item.unique_id || `pansouApi-${Date.now()}-${Math.random()}`,
        channel: item.channel || "",
        datetime: item.datetime || "",
        title: (item.title || "").trim(),
        content: (item.content || "").trim(),
        links: validLinks,
      });
    }
    return out;
  }
}
