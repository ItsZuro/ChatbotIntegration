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