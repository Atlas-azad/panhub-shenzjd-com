<template>
  <section class="duanju-section" v-if="items.length > 0">
    <h2 class="section-title">🎬 热门短剧</h2>
    <div class="duanju-grid">
      <div
        v-for="item in items"
        :key="item.url"
        class="duanju-item"
        @click="handleClick(item)"
      >
        <span class="duanju-title">{{ cleanTitle(item.title) }}</span>
      </div>
    </div>
    <div class="load-more" v-if="hasMore" @click="loadMore">加载更多</div>
  </section>
</template>
 
<script setup lang="ts">
import { ref, onMounted } from "vue";
 
const items = ref<any[]>([]);
const page = ref(1);
const hasMore = ref(false);
const emit = defineEmits(["search"]);
 
function cleanTitle(title: string) {
  return title.replace(/\s+/g, " ").trim();
}
 
function handleClick(item: any) {
  const name = cleanTitle(item.title).replace(/[·\-—].*$/, "").trim();
  if (name) emit("search", name);
}
 
async function fetchDuanju() {
  try {
    const resp = await fetch(
      `/api/duanju-list?page=${page.value}&limit=25`
    );
    const json = await resp.json();
    if (json.code === 0 && json.data) {
      if (page.value === 1) {
        items.value = json.data.items || [];
      } else {
        items.value.push(...(json.data.items || []));
      }
      hasMore.value = json.data.hasMore || false;
    }
  } catch {}
}
 
function loadMore() {
  page.value++;
  fetchDuanju();
}
 
onMounted(fetchDuanju);
</script>
 
<style scoped>
.duanju-section {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.section-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  cursor: pointer;
}
.duanju-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.duanju-item {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  background: var(--card-bg, #f5f5f5);
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.duanju-item:hover {
  background: var(--card-bg-hover, #e8e8e8);
}
.duanju-title {
  font-size: 0.9rem;
}
.load-more {
  text-align: center;
  padding: 1rem;
  cursor: pointer;
  color: #666;
}
.load-more:hover {
  color: #333;
}
</style>
