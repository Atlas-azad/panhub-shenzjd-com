import { defineEventHandler, getQuery } from "h3";
 
export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawPage = parseInt((query.page as string) || "1", 10);
  const rawLimit = parseInt((query.limit as string) || "25", 10);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= 100 ? rawLimit : 25;
 
  try {
    const data = await import("../core/data/duanju.json");
    const items = (data as any).default || data;
    const arr = Array.isArray(items) ? items : [];
    const start = (page - 1) * limit;
    const end = start + limit;
 
    return {
      code: 0,
      message: "success",
      data: {
        category: "duanju",
        items: arr.slice(start, end),
        total: arr.length,
        hasMore: end < arr.length,
        page,
        limit,
      },
    };
  } catch {
    return {
      code: 0,
      message: "success",
      data: { category: "duanju", items: [], total: 0, hasMore: false, page, limit },
    };
  }
});
