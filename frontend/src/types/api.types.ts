export interface UploadUrlResponse {
  success: boolean;
  action: "upload_url_generated";
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

export interface PendingToolCall {
  call_id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface PendingActionResponse {
  action_id: string;
  response_id: string;
  pending_calls: PendingToolCall[];
}

export interface CancelPendingActionResponse {
  success: boolean;
  action: "cancelled";
  conversation_id: string;
}

export interface AssistantResponse {
  request_id: string;
  type: "message";
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
  role: "user" | "assistant";
  content: string;
  created_at: string;
  response_id: string | null;
  executed_tools: ExecutedTool[];
}

export interface SendConversationMessageResponse {
  request_id: string;
  conversation_id: string;

  type: "message" | "confirmation_required";

  response_id: string;
  response: string;

  executed_tools: ExecutedTool[];

  action_id: string | null;

  pending_calls: PendingToolCall[];
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

export interface DashboardMetrics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  executed_actions: number;
  conversations: number;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  integration: string;
  status: "SUCCESS" | "ERROR";
  timestamp: string;
}

export interface DashboardSummaryResponse {
  metrics: DashboardMetrics;
  recent_activity: DashboardActivityItem[];
}

export interface DocumentItem {
  object_key: string;
  file_name: string;
  size: number;
  last_modified: string;
}

export interface DocumentListResponse {
  success: boolean;
  documents: DocumentItem[];
}

export interface DownloadUrlResponse {
  success: boolean;
  action: "download_url_generated";
  object_key: string;
  download_url: string;
  expires_in: number;
}

export interface DeleteDocumentResponse {
  success: boolean;
  action: "document_deleted";
  object_key: string;
  deleted_versions: number;
}

export interface UsageResource {
  used: number;
  limit: number;
  remaining: number;
}

export interface UsageSummaryResponse {
  date: string;
  time_zone: string;
  usage: {
    assistant: UsageResource;
    audio: UsageResource;
    realtime: UsageResource;
  };
}

export interface GoogleConnectResponse {
  authorization_url: string;
}

export interface GoogleIntegrationStatusResponse {
  provider: string;
  connected: boolean;
  connected_at: string | null;
}

export interface GoogleDisconnectResponse {
  success: boolean;
  provider: string;
}

export interface AdminUser {
  sub: string;
  email: string | null;
  status: string;
  enabled: boolean;
  created_at: string;
}

export interface AdminQuotaLimits {
  assistant: number;
  audio: number;
  realtime: number;
}

export interface AdminQuotaResponse {
  user_id: string;
  customized: boolean;
  limits: AdminQuotaLimits;
  defaults: AdminQuotaLimits;
}

export interface CurrentUserResponse {
  sub: string;
  username: string | null;
  groups: string[];
}


