// https://nuxt.com/docs/api/configuration/nuxt-config
import channelsConfig from "./config/channels.json";
 
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  devServer: {
    port: 4000,
  },
  app: {
    head: {
      htmlAttrs: { lang: "zh-CN" },
      title: "胖虎 · 聚合网盘搜索",
      titleTemplate: "%s · 胖虎",
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
        },
        {
          name: "description",
          content:
            "胖虎：聚合阿里云盘、夸克、百度网盘、115、迅雷等平台的网盘搜索工具，实时检索分享资源，快速、高效。",
        },
        {
          name: "keywords",
          content:
            "网盘搜索, 阿里云盘, 夸克, 百度网盘, 115, 迅雷, 资源搜索, 盘搜, 胖虎, 网盘聚合搜索",
        },
        { name: "theme-color", content: "#111111" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "胖虎" },
      ],
      link: [
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon.svg",
        },
      ],
    },
  },
  nitro: {
    // 根据环境变量动态选择部署预设
    preset: process.env.VERCEL
      ? "vercel"
      : process.env.NITRO_PRESET || "node-server",
    // Vercel serverless function 最大执行时间（Pro: 60s, Hobby: 10s）
    vercel: {
      functions: {
        maxDuration: 60,
      },
    },
  },
  routeRules: {
    // 豆瓣热搜允许短时缓存（服务端已有 24 小时内存缓存）
    "/api/douban-hot": { swr: false, cache: false },
    // 搜索接口依赖 Cookie 鉴权，禁止缓存避免 401 被缓存
    "/api/search": { swr: false, cache: false },
    // SSE 搜索流：长连接逐批推送，禁止缓存
    // （默认 /** swr:3600 会把流缓存成 204 空响应）
    "/api/search.stream": { swr: false, cache: false },
    // 链接检测接口需要读 POST body，禁止缓存避免 body 被中间件消费
    "/api/check": { swr: false, cache: false },
    // 图片代理依赖豆瓣，禁止 SWR 缓存避免错误响应被缓存
    "/api/img": { swr: false, cache: false },
    "/**": { swr: 3600 },
  },
  runtimeConfig: {
    // 搜索源（频道/插件）知识只存在于后端，不注入 runtimeConfig。
    defaultConcurrency: channelsConfig.defaultConcurrency,
    pluginTimeoutMs: channelsConfig.pluginTimeoutMs,
    cacheEnabled: true,
    cacheTtlMinutes: channelsConfig.cacheTtlMinutes,
    public: {
      apiBase: "/api",
      siteUrl: "https://panhub.shenzjd.com",
    },
  },
});
