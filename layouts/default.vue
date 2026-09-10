<template>
  <!-- 公告条 -->
  <div v-if="showAnnouncement" class="announce-bar" role="status">
    <span class="announce-bar__icon" aria-hidden="true">📢</span>
    <div ref="viewportEl" class="announce-bar__viewport">
      <span :key="currentIndex" class="announce-bar__slide">
        <span
          ref="textEl"
          class="announce-bar__text"
          :class="{ 'announce-bar__text--scrolling': scrollDistance > 0 }"
          :style="scrollStyle"
        >
          <a
            v-if="currentItem?.link"
            :href="currentItem.link"
            target="_blank"
            rel="noopener"
          >{{ currentItem.text }}</a>
          <template v-else>{{ currentItem?.text }}</template>
        </span>
      </span>
    </div>
    <button class="announce-bar__close" type="button" @click="dismissAnnouncement" aria-label="关闭公告" title="关闭">✕</button>
  </div>
 
  <!-- 主内容区 -->
  <main class="main">
    <slot />
  </main>
 
  <!-- 页脚 -->
  <footer class="site-footer">
    <NuxtLink to="/privacy" class="footer-link">隐私政策</NuxtLink>
    <span class="footer-sep">·</span>
    <span class="footer-copy">© {{ new Date().getFullYear() }} 胖虎网盘搜索</span>
  </footer>
 
  <!-- 自定义支持弹窗 -->
  <Teleport to="body">
    <div v-if="showSupportModal" class="support-overlay" @click.self="closeSupportModal">
      <div class="support-modal">
        <button class="support-close" type="button" @click="closeSupportModal" aria-label="关闭" title="关闭">✕</button>
        <h3 class="support-title">☕ 帮帮小水管服务器</h3>
        <p class="support-desc">服务器成本不小，如果觉得好用，扫码支持一下吧</p>
        <img
          src="/support-qr.png"
          alt="扫码支持"
          class="support-qr"
          @error="($event.target as HTMLImageElement).style.display='none'"
        />
        <div class="support-actions">
          <button class="support-btn" type="button" @click="closeSupportModal">下次一定</button>
          <button class="support-btn support-btn--heart" type="button" @click="onSupportedClick">已支持❤️</button>
        </div>
        <!-- 爱心飘浮动画 -->
        <Transition name="heart-float">
          <div v-if="showHeartAnim" class="heart-anim">❤️</div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>
 
<script setup lang="ts">
useHead({
  script: [
    {
      src: "https://unpkg.com/wx-auth-sdk/dist/wx-auth.umd.js",
      body: true,
      async: true,
    },
    {
      innerHTML: `WxAuth.init({ silent: true, required: false })`,
      body: true,
    },
  ],
});
 
const { loadSettings } = useSettings();
 
onMounted(() => {
  loadSettings();
  loadAnnouncements();
  window.addEventListener("show-support-modal", onShowSupportModal);
});
 
onBeforeUnmount(() => {
  window.removeEventListener("show-support-modal", onShowSupportModal);
});
 
// ===== 自定义支持弹窗 =====
const showSupportModal = ref(false);
const showHeartAnim = ref(false);
 
function onShowSupportModal() {
  showSupportModal.value = true;
}
 
function closeSupportModal() {
  showSupportModal.value = false;
}
 
function onSupportedClick() {
  showHeartAnim.value = true;
  setTimeout(() => {
    showHeartAnim.value = false;
    closeSupportModal();
  }, 800);
}
 
// ===== 公告条 =====
interface AnnouncementItem {
  id: string;
  text: string;
  link?: string;
}
interface AnnouncementPayload {
  version: number;
  items: AnnouncementItem[];
}
const ANNOUNCEMENT_KEY_PREFIX = "panhub:announcement-dismissed:v";
const ROTATE_INTERVAL_MS = 6000;
 
const showAnnouncement = ref(false);
const announcements = ref<AnnouncementItem[]>([]);
const announcementVersion = ref(0);
const currentIndex = ref(0);
const viewportEl = ref<HTMLElement | null>(null);
const textEl = ref<HTMLElement | null>(null);
const scrollDistance = ref(0);
let rotateTimer: ReturnType<typeof setInterval> | null = null;
 
const currentItem = computed(() => announcements.value[currentIndex.value] ?? null);
 
const scrollStyle = computed(() => {
  if (scrollDistance.value <= 0) return {};
  const duration = Math.max(6, Math.round(scrollDistance.value / 30));
  return {
    "--announce-scroll-distance": `-${scrollDistance.value}px`,
    "--announce-scroll-duration": `${duration}s`,
  };
});
 
async function loadAnnouncements() {
  let data: AnnouncementPayload | null = null;
  try {
    const res = await $fetch<{ code: number; data: AnnouncementPayload }>(
      `${useRuntimeConfig().public.apiBase}/announcement`
    );
    if (res?.code === 0 && Array.isArray(res.data?.items) && res.data.items.length > 0) {
      data = res.data;
    }
  } catch {}
  if (!data) return;
 
  announcements.value = data.items;
  announcementVersion.value = data.version;
  try {
    if (localStorage.getItem(`${ANNOUNCEMENT_KEY_PREFIX}${data.version}`)) return;
  } catch {}
  showAnnouncement.value = true;
 
  if (data.items.length > 1) {
    rotateTimer = setInterval(() => {
      currentIndex.value = (currentIndex.value + 1) % announcements.value.length;
    }, ROTATE_INTERVAL_MS);
  }
  await nextTick();
  measureScroll();
}
 
function measureScroll() {
  const vp = viewportEl.value;
  const tx = textEl.value;
  if (!vp || !tx) {
    scrollDistance.value = 0;
    return;
  }
  const dist = Math.ceil(tx.scrollWidth - vp.clientWidth);
  scrollDistance.value = dist > 4 ? dist : 0;
}
 
watch(currentIndex, () => {
  nextTick(measureScroll);
});
 
function onResize() {
  if (showAnnouncement.value) measureScroll();
}
onMounted(() => window.addEventListener("resize", onResize));
onBeforeUnmount(() => {
  window.removeEventListener("resize", onResize);
  if (rotateTimer) {
    clearInterval(rotateTimer);
    rotateTimer = null;
  }
});
 
function dismissAnnouncement() {
  showAnnouncement.value = false;
  try {
    localStorage.setItem(`${ANNOUNCEMENT_KEY_PREFIX}${announcementVersion.value}`, "1");
  } catch {}
}
</script>
 
<style scoped>
/* 公告条 */
.announce-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 7px 16px;
  background: linear-gradient(90deg, rgba(15, 118, 110, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%);
  border-bottom: 1px solid rgba(15, 118, 110, 0.12);
  font-size: 13px;
  color: var(--text-secondary, #4b5563);
  line-height: 1.5;
  animation: barSlideIn 0.3s ease;
}
.announce-bar__icon {
  flex-shrink: 0;
}
.announce-bar__viewport {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
}
.announce-bar__slide {
  display: inline-block;
  max-width: 100%;
  animation: barSlideIn 0.3s ease;
}
.announce-bar__text {
  display: inline-block;
  white-space: nowrap;
}
.announce-bar__text a {
  color: var(--primary, #0f766e);
  text-decoration: underline;
}
.announce-bar__text--scrolling {
  animation: announceBounce var(--announce-scroll-duration, 12s) ease-in-out infinite alternate;
  will-change: transform;
}
.announce-bar__viewport:hover .announce-bar__text--scrolling {
  animation-play-state: paused;
}
.announce-bar__text strong {
  color: var(--primary, #0f766e);
}
.announce-bar__close {
  flex-shrink: 0;
  background: none;
  border: none;
  font-size: 14px;
  color: var(--text-tertiary, #9ca3af);
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}
.announce-bar__close:hover {
  color: var(--text-secondary, #4b5563);
}
@keyframes barSlideIn {
  from {
    transform: translateY(-4px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes announceBounce {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(var(--announce-scroll-distance, -100px));
  }
}
 
/* 页脚 */
.site-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 18px 16px 28px;
  font-size: 13px;
  color: var(--text-tertiary, #9ca3af);
}
.footer-link {
  color: var(--text-secondary, #6b7280);
  text-decoration: none;
}
.footer-link:hover {
  color: var(--accent, #2563eb);
}
.footer-sep {
  opacity: 0.5;
}
 
/* ===== 自定义支持弹窗 ===== */
.support-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: supportFadeIn 0.25s ease;
}
.support-modal {
  background: var(--bg-glass, #ffffff);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border, rgba(0,0,0,0.08));
  border-radius: 16px;
  padding: 32px 28px 24px;
  text-align: center;
  max-width: 320px;
  width: 90vw;
  position: relative;
  animation: supportSlideIn 0.3s ease;
}
.support-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-tertiary, #9ca3af);
  line-height: 1;
  transition: color 0.15s;
}
.support-close:hover {
  color: var(--text-secondary, #4b5563);
}
.support-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}
.support-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}
.support-qr {
  width: 200px;
  height: 200px;
  margin: 0 auto 16px;
  display: block;
  border-radius: 8px;
  object-fit: contain;
}
.support-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.support-btn {
  padding: 8px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border, rgba(0,0,0,0.08));
  color: var(--text-secondary, #6b7280);
  transition: all 0.15s;
}
.support-btn:hover {
  background: var(--bg-tertiary, #e5e7eb);
  color: var(--text-primary, #111827);
}
.support-btn--heart {
  background: linear-gradient(135deg, #fce4ec 0%, #f8bbd0 100%) !important;
  border-color: rgba(233, 30, 99, 0.15) !important;
  color: #c2185b !important;
}
.support-btn--heart:hover {
  background: linear-gradient(135deg, #f8bbd0 0%, #f48fb1 100%) !important;
  color: #880e4f !important;
}
/* 爱心飘浮动画 */
.heart-anim {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 64px;
  pointer-events: none;
  z-index: 10;
}
.heart-float-enter-active {
  animation: heartPop 0.8s ease-out forwards;
}
.heart-float-leave-active {
  animation: heartFade 0.3s ease-in forwards;
}
@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  30% { transform: translate(-50%, -50%) scale(1.4); opacity: 1; }
  50% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -70%) scale(1.1); opacity: 0; }
}
@keyframes heartFade {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes supportFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes supportSlideIn {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

  /* 主内容区居中限宽 */
.main {
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}
 
/* 页脚间距加大 */
.site-footer {
  padding: 24px 16px 32px;
}
</style>
