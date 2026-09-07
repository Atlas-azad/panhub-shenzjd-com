/**
 * 公告服务（本地自定义版）
 *
 * 公告内容在本文件维护，不依赖外部数据源。
 * 修改 CUSTOM_ANNOUNCEMENTS 即可自定义公告文字。
 */
 
export interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
}
 
export interface AnnouncementPayload {
  version: number;
  items: AnnouncementItem[];
}
 
/** ============================================
 *  👇 在这里修改你的公告内容
 *  - id：随便写，不同公告别重复就行
 *  - text：公告文字
 *  - link：可选，点击公告跳转的地址，不需要就删掉这行
 *  ============================================ */
const CUSTOM_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "welcome",
    text: "本站靠自愿赞助贴补服务器开销，广告窗随时可关，不影响任何功能。若您觉得本站有用，欢迎请作者喝杯咖啡，让网站走得更远 ❤️",
    link: "https://home.azad.asia/ds",
  },
];
 
/** 版本号，改公告内容后递增此值，前端会据此刷新 */
const CUSTOM_ANNOUNCEMENT_VERSION = 1;
 
export async function getAnnouncements(): Promise<AnnouncementPayload> {
  return {
    version: CUSTOM_ANNOUNCEMENT_VERSION,
    items: CUSTOM_ANNOUNCEMENTS,
  };
}
