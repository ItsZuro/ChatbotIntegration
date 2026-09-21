import type { TranscriptionResponse } from "../types/api.types";

import { api } from "./api";

import type { RealtimeTranscriptionSessionResponse } from "../types/api.types";

function getAudioExtension(mimeType: string) {
  if (mimeType.includes("mp4")) {
    return "m4a";
  }

  if (mimeType.includes("ogg")) {
    return "ogg";
  }

  return "webm";
}

export async function transcribeAudio(
  audioBlob: Blob,
): Promise<TranscriptionResponse> {
  const formData = new FormData();

  const mimeType = audioBlob.type || "audio/webm";

  const extension = getAudioExtension(mimeType);

  const audioFile = new File([audioBlob], `recording.${extension}`, {
    type: mimeType,
  });

  formData.append("file", audioFile);

  const { data } = await api.post<TranscriptionResponse>(
    "/audio/transcribe",
    formData,
  );

  return data;
}

export async function createRealtimeTranscriptionSession(): Promise<RealtimeTranscriptionSessionResponse> {
  const { data } = await api.post<RealtimeTranscriptionSessionResponse>(
    "/audio/realtime-session",
  );

  return data;
}
