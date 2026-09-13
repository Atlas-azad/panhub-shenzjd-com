const STORAGE_KEY = 'panhub_magnet_key';
 
export function useMagnetKey() {
  const magnetKey = useState<string>('magnet-key', () => '');
 
  // 页面加载时从 localStorage 恢复密令
  if (import.meta.client) {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) magnetKey.value = saved;
  }
 
  function setKey(key: string) {
    magnetKey.value = key;
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, key);
    }
  }
 
  function clearKey() {
    magnetKey.value = '';
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
 
  return { magnetKey, setKey, clearKey };
}
