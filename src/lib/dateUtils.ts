/** 获取本地日期字符串 YYYY-MM-DD，避免 toISOString 的 UTC 时区偏移问题 */
export function toLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
