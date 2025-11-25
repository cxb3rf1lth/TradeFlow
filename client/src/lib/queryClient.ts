import { QueryClient } from "@tanstack/react-query";
import { authorizedFetch } from "./api-client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const res = await authorizedFetch(queryKey[0] as string);
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

  if (typeof urlOrOptions === "string") {
    method = methodOrUrl;
    url = urlOrOptions;
    data = dataOrUndefined;
  } else {
    method = "GET";
    url = methodOrUrl;
    data = undefined;
  }

  const options: RequestInit = {
    method,
    ...((urlOrOptions && typeof urlOrOptions !== "string") ? urlOrOptions : {}),
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return authorizedFetch(url, options);
}
