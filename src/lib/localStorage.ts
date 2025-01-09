export function readObjectFromLocalStorage<T extends object>(key: string) {
    try {
      const object: T | null = JSON.parse(localStorage.getItem(key) ?? "null");
  
      return object;
    } catch (e) {
      return null;
    }
  }
  