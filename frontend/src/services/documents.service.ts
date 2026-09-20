import axios from 'axios';

import { api } from './api';

import type {
  UploadUrlResponse,
} from '../types/api.types';


interface CreateUploadUrlInput {
  fileName: string;
  contentType: string;
}


export async function createUploadUrl({
  fileName,
  contentType,
}: CreateUploadUrlInput): Promise<UploadUrlResponse> {
  const { data } = await api.post<UploadUrlResponse>(
    '/documents/upload-url',
    {
      file_name: fileName,
      content_type: contentType,
    }
  );

  return data;
}


export async function uploadDocument(
  uploadUrl: string,
  file: File
): Promise<void> {
  await axios.put(
    uploadUrl,
    file,
    {
      headers: {
        'Content-Type': file.type,
      },
    }
  );
}