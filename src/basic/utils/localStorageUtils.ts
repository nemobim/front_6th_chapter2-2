/** localStorage에서 데이터 로드 */
export const loadDataFromStorage = <T>(key: string, initialData: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return initialData;
    }
  }
  return initialData;
};
