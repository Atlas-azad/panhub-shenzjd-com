import { defineEventHandler, getQuery } from "h3";
import { ofetch } from "ofetch";
 
export default defineEventHandler(async (event) => {
  const q = getQuery(event);
  const kw = ((q.kw as string) || "斗破苍穹").trim();
 
  // 第一步：测试 ofetch 能不能拿到 HTML
  let html = "";
  let fetchError = "";
  try {
    html = await ofetch<string>(
      `https://xiaokupan.com/s/${encodeURIComponent(kw)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          Referer: "https://xiaokupan.com/",
        },
        timeout: 8000,
      }
    );
  } catch (err: any) {
    fetchError = err?.message || String(err);
  }
 
  // 第二步：测试正则能不能匹配
  const STREAM_REGEX =
    /\{url:"((?:\\.|[^"\\])*)",password:"((?:\\.|[^"\\])*)",note:"((?:\\.|[^"\\])*)"/g;
  const matches = [...html.matchAll(STREAM_REGEX)];
 
  return {
    keyword: kw,
    htmlLength: html.length,
    fetchError: fetchError || null,
    regexMatchCount: matches.length,
    sampleResults: matches.slice(0, 3).map((m) => ({
      url: m[1],
      password: m[2],
      note: m[3],
    })),
  };
});
