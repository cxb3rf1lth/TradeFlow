import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await fetch(queryKey[0] as string);
        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }
          throw new Error(`${res.status}: ${await res.text()}`);
        }
        return res.json();
      },
      staleTime: 1000 * 60, // 1 minute
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper function for API requests
export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | RequestInit,
  dataOrUndefined?: any
): Promise<Response> {
  let method: string;
  let url: string;
  let data: any;

  // Support both signatures:
  // 1. apiRequest(method, url, data) - legacy
  // 2. apiRequest(url, options) - new
  if (typeof urlOrOptions === 'string') {
    method = methodOrUrl;
    url = urlOrOptions;
    data = dataOrUndefined;
  } else {
    method = 'GET';
    url = methodOrUrl;
    data = undefined;
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res;
}
