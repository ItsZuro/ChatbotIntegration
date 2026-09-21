import axios from "axios";

import { api } from "./api";

import type {
  DeleteDocumentResponse,
  DocumentListResponse,
  DownloadUrlResponse,
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
  const { data } = await api.post<UploadUrlResponse>("/documents/upload-url", {
    file_name: fileName,
    content_type: contentType,
  });

  return data;
}

export async function uploadDocument(
  uploadUrl: string,
  file: File,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
}

export async function getDocuments(): Promise<
  DocumentListResponse
> {
  const { data } =
    await api.get<DocumentListResponse>(
      '/documents'
    );

  return data;
}


export async function createDownloadUrl(
  objectKey: string
): Promise<DownloadUrlResponse> {
  const { data } =
    await api.post<DownloadUrlResponse>(
      '/documents/download-url',
      {
        object_key: objectKey,
      }
    );

  return data;
}

export async function deleteDocument(
  objectKey: string
): Promise<DeleteDocumentResponse> {
  const { data } =
    await api.delete<DeleteDocumentResponse>(
      '/documents',
      {
        params: {
          object_key: objectKey,
        },
      }
    );

  return data;
}

