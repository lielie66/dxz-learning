/** 读取 JSON；解析失败或不存在时返回 fallback。 */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value as T;
  } catch {
    return fallback;
  }
}

/** 写入 JSON；空间不足等异常静默忽略。 */
export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* 空间不足时忽略 */
  }
}

/**
 * 先读新键；没有则读旧键，并迁移到新键。
 * 旧键保留一个版本，方便回滚。
 */
export function readMigratedJSON<T>(key: string, legacyKey: string | undefined, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    if (!legacyKey) return fallback;
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) return fallback;
    const value = JSON.parse(legacy) as T;
    writeJSON(key, value);
    return value;
  } catch {
    return fallback;
  }
}
