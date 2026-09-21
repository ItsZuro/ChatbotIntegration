export interface UploadUrlResponse {
  success: boolean;
  action: 'upload_url_generated';
  bucket: string;
  object_key: string;
  upload_url: string;
  expires_in: number;
}

export interface ToolResult {
  success: boolean;
  action?: string;
  [key: string]: unknown;
}

export interface ExecutedTool {
  name: string;
  result: ToolResult;
}

export interface AssistantResponse {
  request_id: string;
  type: 'message';
  response_id: string;
  response: string;
  executed_tools: ExecutedTool[];
}

export interface Conversation {
  conversation_id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationMessage {
  message_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  response_id: string | null;
  executed_tools: ExecutedTool[];
}

export interface SendConversationMessageResponse {
  request_id: string;
  conversation_id: string;
  response_id: string;
  response: string;
  executed_tools: ExecutedTool[];
}

export interface TranscriptionResponse {
  text: string;
  model: string;
}

export interface RealtimeTranscriptionSessionResponse {
  client_secret: string;
  expires_at: number;
  model: string;
}