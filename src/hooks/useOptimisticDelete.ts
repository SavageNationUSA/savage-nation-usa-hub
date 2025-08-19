import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";

type OptimisticContext<T> = { previousItems?: T[] };

export function useOptimisticDelete<T extends { id: string }>(
  options: {
    queryKey: QueryKey;
    deleteFn: (id: string) => Promise<void>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await options.deleteFn(id);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previousItems = queryClient.getQueryData<T[]>(options.queryKey);
      if (previousItems) {
        queryClient.setQueryData<T[]>(
          options.queryKey,
          previousItems.filter((item) => item.id !== id)
        );
      }
      return { previousItems } as OptimisticContext<T>;
    },
    onError: (_err, _id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(options.queryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: options.queryKey });
    },
  });
}

