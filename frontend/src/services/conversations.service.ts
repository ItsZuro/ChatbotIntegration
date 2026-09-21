import { api } from './api';

import type {
  CancelPendingActionResponse,
  Conversation,
  ConversationMessage,
  PendingActionResponse,
  SendConversationMessageResponse,
} from '../types/api.types';

interface RenameConversationInput {
  conversationId: string;
  title: string;
}


interface CreateConversationInput {
  title?: string;
}

interface SendConversationMessageInput {
  conversationId: string;
  message: string;
  objectKey?: string;
}


export async function createConversation({
  title = 'Nueva conversación',
}: CreateConversationInput = {}): Promise<Conversation> {
  const { data } = await api.post<Conversation>(
    '/conversations',
    {
      title,
    }
  );

  return data;
}


export async function getConversations(): Promise<
  Conversation[]
> {
  const { data } = await api.get<Conversation[]>(
    '/conversations'
  );

  return data;
}


export async function getConversationMessages(
  conversationId: string
): Promise<ConversationMessage[]> {
  const { data } = await api.get<ConversationMessage[]>(
    `/conversations/${conversationId}/messages`
  );

  return data;
}


export async function sendConversationMessage({
  conversationId,
  message,
  objectKey,
}: SendConversationMessageInput): Promise<
  SendConversationMessageResponse
> {
  const { data } =
    await api.post<SendConversationMessageResponse>(
      `/conversations/${conversationId}/messages`,
      {
        message,
        ...(objectKey
          ? {
              object_key: objectKey,
            }
          : {}),
      }
    );

  return data;
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  await api.delete(
    `/conversations/${conversationId}`
  );
}

export async function renameConversation({
  conversationId,
  title,
}: RenameConversationInput): Promise<Conversation> {
  const { data } =
    await api.patch<Conversation>(
      `/conversations/${conversationId}`,
      {
        title,
      }
    );

  return data;
}

export async function getPendingConversationAction(
  conversationId: string
): Promise<PendingActionResponse | null> {
  const { data } =
    await api.get<PendingActionResponse | null>(
      `/conversations/${conversationId}/actions/pending`
    );

  return data;
}


export async function confirmConversationAction(
  conversationId: string,
  actionId: string
): Promise<SendConversationMessageResponse> {
  const { data } =
    await api.post<SendConversationMessageResponse>(
      `/conversations/${conversationId}/actions/confirm`,
      {
        action_id: actionId,
      }
    );

  return data;
}


export async function cancelConversationAction(
  conversationId: string,
  actionId: string
): Promise<CancelPendingActionResponse> {
  const { data } =
    await api.post<CancelPendingActionResponse>(
      `/conversations/${conversationId}/actions/cancel`,
      {
        action_id: actionId,
      }
    );

  return data;
}