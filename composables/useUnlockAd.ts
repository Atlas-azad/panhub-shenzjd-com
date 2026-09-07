/**
 * 自愿支持弹窗触发逻辑
 * 每搜索 3 次，通过 CustomEvent 通知 default.vue 显示自定义支持弹窗
 */
 
/** 每搜索多少次自愿弹一次 */
const POPUP_EVERY = 3;
/** 搜索计数 localStorage key */
const SEARCH_COUNT_KEY = "panhub:search-count";
 
/**
 * 每次搜索调用：计数 +1，每第 POPUP_EVERY 次触发支持弹窗。
 * 永不抛错、永不阻塞搜索。
 */
export function maybeShowUnlockAd(): void {
  if (typeof window === "undefined") return;
 
  let count = 0;
  try {
    count = parseInt(localStorage.getItem(SEARCH_COUNT_KEY) || "0", 10) || 0;
  } catch {}
  count += 1;
  try {
    localStorage.setItem(SEARCH_COUNT_KEY, String(count));
  } catch {}
 
  if (count % POPUP_EVERY !== 0) return;
 
  try {
    window.dispatchEvent(new CustomEvent("show-support-modal"));
  } catch (e) {
    console.warn("[support-modal] 弹窗事件派发失败，跳过", e);
  }
}
 
/** composable 包装，供页面以 useUnlockAd() 形式调用 */
export function useUnlockAd() {
  return { maybeShowUnlockAd };
}
