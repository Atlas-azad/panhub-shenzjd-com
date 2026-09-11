import { BaseAsyncPlugin } from "./manager";
import type { SearchResult } from "../types/models";
import { ofetch } from "ofetch";
 
/**
 * PanSou API 搜索插件
 * 对接 fish2018/pansou 的标准 /api/search 接口
 * 可配置多个上游地址实现容灾
 *
 * 接口文档: https://github.com/fish2018/pansou
 * 请求: POST /api/search  { kw, src, res, cloud_types }
 * 响应: { total, results: [{ unique_id, title, content, links, datetime, channel }] }
 */
 
const PANSOU_ENDPOINTS = [
  "https://pansou.app",       // 源 #3：在线公共站
  // "http://localhost:8888",  // 源 #2：自部署 OnePanSearchApi，取消注释并改地址
];
 
type PanSouLink = { type: string; url: string; password?: string };
type PanSouResult = {
  unique_id?: string;
  title?: string;
  content?: string;
  links?: PanSouLink[];
  datetime?: string;
  channel?: string;
};
type PanSouResponse = {
  total?: number;
  results?: PanSouResult[];
};
 
/** 将 PanSou 的 link type 映射到本项目 PLATFORM_INFO key */
function mapPanSouType(t: string): string {
  const map: Record<string, string> = {
    baidu: "baidu",
    aliyun: "aliyun",
    quark: "quark",
    tianyi: "tianyi",
    uc: "uc",
    mobile: "mobile",
    "115": "115",
    pikpak: "pikpak",
    xunlei: "xunlei",
    "123": "123",
    magnet: "magnet",
    ed2k: "ed2k",
  };
  return map[t] || "others";
}
 
export class PansouApiPlugin extends BaseAsyncPlugin {
  constructor() {
    super("pansouApi", 2);
  }
 
  override async search(
    keyword: string,
    ext?: Record<string, any>
  ): Promise<SearchResult[]> {
    const timeout = Math.max(
      3000,
      Number((ext as any)?.__plugin_timeout_ms) || 10000
    );
    const kw = (keyword || "").trim();
    if (!kw) return [];
 
    // 依次尝试各上游，首个成功即返回
    for (const base of PANSOU_ENDPOINTS) {
      try {
        const resp = await ofetch<PanSouResponse>(`${base}/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          body: {
            kw,
            src: "all",         // 搜全部来源（TG + 插件）
            res: "results",     // 只要 results 数组，不需要 merge
          },
          timeout,
        });
 
        const items = resp?.results;
        if (!Array.isArray(items) || items.length === 0) continue;
 
        return items
          .filter((item) => Array.isArray(item.links) && item.links.length > 0)
          .map((item) => ({
            message_id: "",
            unique_id: item.unique_id || `pansouApi-${Date.now()}-${Math.random()}`,
            channel: item.channel || "",
            datetime: item.datetime || "",
            title: (item.title || "").trim(),
            content: (item.content || "").trim(),
            links: item.links!
              .filter((l) => l.url && !l.url.toLowerCase().startsWith("magnet:"))
              .map((l) => ({
                type: mapPanSouType(l.type),
                url: l.url,
                password: l.password || "",
              })),
          }))
          .filter((r) => r.links.length > 0);
      } catch {
        continue; // 当前上游失败，试下一个
      }
    }
    return [];
  }
}
