import { api } from './api';

import type {
  AssistantResponse,
} from '../types/api.types';


interface SendAssistantRequestInput {
  message: string;
  objectKey?: string;
}


export async function sendAssistantRequest({
  message,
  objectKey,
}: SendAssistantRequestInput): Promise<AssistantResponse> {
  const { data } = await api.post<AssistantResponse>(
    '/assistant/message',
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