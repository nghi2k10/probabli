// Đọc/ghi JSON vào localStorage một cách an toàn.
// Không throw lỗi nếu localStorage không khả dụng (private mode, quota đầy, SSR...).

export function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Bỏ qua: private browsing, quota đầy, hoặc môi trường không có localStorage
  }
}