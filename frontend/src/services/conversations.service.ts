import { api } from './api';

import type {
  Conversation,
  ConversationMessage,
  SendConversationMessageResponse,
} from '../types/api.types';


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