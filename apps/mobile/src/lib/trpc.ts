import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import superjson from 'superjson';
import React, { useState } from 'react';
import { getToken } from './auth';

import type { AppRouter } from '@rankflo/api';

/**
 * tRPC React hooks — typed to your API router.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * API base URL — configurable via environment variable.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Create a tRPC client instance with auth headers and superjson transformer.
 */
function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${API_URL}/api/trpc`,
        transformer: superjson,
        async headers() {
          const token = await getToken();
          return token
            ? { Authorization: `Bearer ${token}` }
            : {};
        },
      }),
    ],
  });
}

/**
 * Provider component that wraps the app with tRPC + React Query.
 */
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 2,
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  );

  const [trpcClient] = useState(createTRPCClient);

  return React.createElement(
    trpc.Provider,
    { client: trpcClient, queryClient },
    React.createElement(QueryClientProvider, { client: queryClient }, children),
  );
}

export { QueryClient, QueryClientProvider };
export default trpc;
