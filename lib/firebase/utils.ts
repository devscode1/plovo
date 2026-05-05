export function convertTimestamps<T>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === "object") {
    // If it has a toDate method (like Firestore Timestamp), call it
    if (typeof obj.toDate === "function") {
      return obj.toDate();
    }
    
    // If it's an array, map over it
    if (Array.isArray(obj)) {
      return obj.map(convertTimestamps) as any;
    }
    
    // If it's a plain object, recursively convert its properties
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = convertTimestamps(obj[key]);
      }
    }
    return newObj;
  }
  
  return obj;
}
