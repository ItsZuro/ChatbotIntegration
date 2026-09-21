import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelConversationAction,
  confirmConversationAction,
  createConversation,
  deleteConversation,
  getConversationMessages,
  getConversations,
  getPendingConversationAction,
  renameConversation,
  sendConversationMessage,
} from "../../../services/conversations.service";

export const conversationKeys = {
  all: ["conversations"] as const,

  messages: (conversationId: string) =>
    ["conversations", conversationId, "messages"] as const,

  pendingAction: (conversationId: string) =>
    ["conversations", conversationId, "pending-action"] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: getConversations,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.messages(conversationId)
      : ["conversations", "none", "messages"],
    queryFn: () => getConversationMessages(conversationId as string),
    enabled: Boolean(conversationId),
  });
}

export function usePendingConversationAction(conversationId: string | null) {
  return useQuery({
    queryKey: conversationId
      ? conversationKeys.pendingAction(conversationId)
      : ["conversations", "none", "pending-action"],

    queryFn: () => getPendingConversationAction(conversationId as string),

    enabled: Boolean(conversationId),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
  });
}

export function useSendConversationMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendConversationMessage,

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(variables.conversationId),
        }),

        queryClient.invalidateQueries({
          queryKey: conversationKeys.pendingAction(variables.conversationId),
        }),

        queryClient.invalidateQueries({
          queryKey: conversationKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["activity"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["documents"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["usage"],
        }),
      ]);
    },
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: renameConversation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,

    onSuccess: async (_, conversationId) => {
      queryClient.removeQueries({
        queryKey: conversationKeys.messages(conversationId),
      });

      await queryClient.invalidateQueries({
        queryKey: conversationKeys.all,
      });
    },
  });
}

export function useConfirmConversationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      actionId,
    }: {
      conversationId: string;
      actionId: string;
    }) =>
      confirmConversationAction(
        conversationId,
        actionId
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.messages(
              variables.conversationId
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.pendingAction(
              variables.conversationId
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.all,
        }),

        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["activity"],
        }),
      ]);
    },
  });
}


export function useCancelConversationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      actionId,
    }: {
      conversationId: string;
      actionId: string;
    }) =>
      cancelConversationAction(
        conversationId,
        actionId
      ),

    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.messages(
              variables.conversationId
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.pendingAction(
              variables.conversationId
            ),
        }),

        queryClient.invalidateQueries({
          queryKey:
            conversationKeys.all,
        }),
      ]);
    },
  });
}
