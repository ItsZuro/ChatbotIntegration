import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteDocument,
  createDownloadUrl,
  getDocuments,
} from '../../../services/documents.service';


export const documentKeys = {
  all: [
    'documents',
  ] as const,

  list: [
    'documents',
    'list',
  ] as const,
};


export function useDocuments() {
  return useQuery({
    queryKey:
      documentKeys.list,

    queryFn:
      getDocuments,

    staleTime:
      15_000,

    refetchOnWindowFocus:
      true,
  });
}


export function useDownloadDocument() {
  return useMutation({
    mutationFn:
      createDownloadUrl,
  });
}

export function useDeleteDocument() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      deleteDocument,

    onSuccess:
      async () => {
        await queryClient
          .invalidateQueries({
            queryKey:
              documentKeys.all,
          });
      },
  });
}
