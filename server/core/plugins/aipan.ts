import { BaseAsyncPlugin } from "./manager";
import type { SearchResult, Link } from "../types/models";
import { ofetch } from "ofetch";
import pLimit from "p-limit";
import { extractLinksFromText, cleanHTML } from "./panLink";
 
/**
 * aipan（短剧资源站）搜索插件
 *
 * 站点：https://duanju.aipan.me/
 * 特点：短剧资源为主，详情页内嵌夸克/百度等网盘直链
 * 模式：搜索页拿链接列表 → 并发抓详情页提取网盘链接
 */
 
const BASE = "https://duanju.aipan.me";
const MAX_DETAILS = 8;
const DETAIL_CONCURRENCY = 3;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
 
function extractAipanLinks(html: string): Link[] {
  const links = extractLinksFromText(html);
  return links
    .map((l) => {
      // 去掉尾随反斜杠
      const url = l.url.replace(/\\+$/, "");
      if (l.password) return { ...l, url };
      try {
        const u = new URL(url);
        const pwd = u.searchParams.get("pwd") || u.searchParams.get("password") || "";
        if (pwd) return { ...l, url, password: pwd };
      } catch {}
      return { ...l, url };
    })
    .filter((l, i, arr) => arr.findIndex((x) => x.url === l.url) === i); // URL 去重
}
 
/** 从搜索结果页 HTML 提取详情页链接 */
function parseSearchPage(html: string): { url: string; title: string }[] {
  const items: { url: string; title: string }[] = [];
  // 匹配 /drama/{id} 格式的链接
  const regex = /<a[^>]*href=["']((?:\/drama\/|https?:\/\/duanju\.aipan\.me\/drama\/)[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    let url = m[1].trim();
    if (url.startsWith("/")) url = BASE + url;
    const title = cleanHTML(m[2]).replace(/\s+/g, " ").trim().slice(0, 200);
    if (title && url.includes("/drama/")) {
      items.push({ url, title });
    }
  }
  // 去重
  const seen = new Set<string>();
  return items.filter((it) => {
    if (seen.has(it.url)) return false;
    seen.add(it.url);
    return true;
  });
}
 
export class AipanPlugin extends BaseAsyncPlugin {
  constructor() {
    super("aipan", 2);
  }
 
  override async search(
    keyword: string,
    ext?: Record<string, any>
  ): Promise<SearchResult[]> {
    const timeout = Math.max(
      3000,
      Number((ext as any)?.__plugin_timeout_ms) || 12000
    );
    const kw = (keyword || "").trim();
    if (!kw) return [];
 
    // 第一步：搜索页
    let detailItems: { url: string; title: string }[] = [];
    try {
         const html = await ofetch<string>(
        `${BASE}/?search=${encodeURIComponent(kw)}`,
        {
          headers: { "user-agent": UA },
          timeout,
          responseType: "text",
        }
      );
      detailItems = parseSearchPage(html);
    } catch {
      return [];
    }
    if (detailItems.length === 0) return [];
 
    // 第二步：并发抓详情页提取网盘链接
    const limitFn = pLimit(DETAIL_CONCURRENCY);
    const tasks = detailItems.slice(0, MAX_DETAILS).map((item, idx) =>
      limitFn(async (): Promise<SearchResult | null> => {
        try {
            const html = await ofetch<string>(item.url, {
            headers: { "user-agent": UA },
            timeout,
            responseType: "text",
          });
          const links = extractAipanLinks(html);
          if (links.length === 0) return null;
          return {
            message_id: "",
            unique_id: `aipan-${idx}-${Date.now()}`,
            channel: "",
            datetime: "",
            title: item.title,
            content: item.title,
            links,
          };
        } catch {
          return null;
        }
      })
    );
 
    const results = await Promise.all(tasks);
    return results.filter((r): r is SearchResult => r !== null);
  }
}
