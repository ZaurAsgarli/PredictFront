/**
 * Pagination utilities for fetching all data from backend
 */

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Fetch all pages of paginated data
 * @param fetchPage - Function that fetches a single page (returns PaginatedResponse)
 * @param pageSize - Number of items per page (default: 100)
 * @returns All items from all pages
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>,
  pageSize: number = 100
): Promise<T[]> {
  const allItems: T[] = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetchPage(currentPage, pageSize);
      
      if (response.results && Array.isArray(response.results)) {
        allItems.push(...response.results);
      }
      
      // Check if there's a next page
      hasMore = response.next !== null && response.next !== undefined;
      currentPage++;
      
      // Safety limit: prevent infinite loops
      if (currentPage > 1000) {
        console.warn('Pagination limit reached (1000 pages). Stopping.');
        break;
      }
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      hasMore = false;
    }
  }

  return allItems;
}

/**
 * Fetch all items from a paginated API endpoint
 * @param api - Axios instance
 * @param endpoint - API endpoint (without query params)
 * @param params - Additional query parameters
 * @param pageSize - Items per page (default: 100)
 * @returns All items from all pages
 */
export async function fetchAllFromPaginatedEndpoint<T>(
  api: any,
  endpoint: string,
  params: Record<string, any> = {},
  pageSize: number = 100
): Promise<T[]> {
  return fetchAllPages<T>(
    async (page: number, size: number) => {
      const response = await api.get(endpoint, {
        params: {
          ...params,
          page,
          page_size: size,
        },
      });
      
      // Handle different response formats
      if (response.data.results) {
        return response.data;
      } else if (Array.isArray(response.data)) {
        // Non-paginated response (all items in one array)
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        };
      } else {
        // Single object or unexpected format
        return {
          count: 1,
          next: null,
          previous: null,
          results: [response.data],
        };
      }
    },
    pageSize
  );
}
