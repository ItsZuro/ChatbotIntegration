import { useState } from "react";

import { useMutation } from "@tanstack/react-query";

import {
  createUploadUrl,
  uploadDocument,
} from "../../../services/documents.service";

import { sendAssistantRequest } from "../../../services/assistant.service";

import type { AssistantResponse } from "../../../types/api.types";

import type { SelectedDocument } from "../types/request.types";

export type RequestStage =
  "idle" | "preparing-upload" | "uploading" | "processing" | "success";

interface SubmitRequestInput {
  message: string;
  document?: SelectedDocument | null;
}

export function useSubmitRequest() {
  const [stage, setStage] = useState<RequestStage>("idle");

  const mutation = useMutation<AssistantResponse, Error, SubmitRequestInput>({
    mutationKey: ["submit-request"],

    mutationFn: async ({ message, document }) => {
      let objectKey: string | undefined;

      if (document) {
        setStage("preparing-upload");

        const uploadData = await createUploadUrl({
          fileName: document.name,
          contentType: document.contentType,
        });

        setStage("uploading");

        await uploadDocument(uploadData.upload_url, document.file);

        objectKey = uploadData.object_key;
      }

      setStage("processing");

      const response = await sendAssistantRequest({
        message,
        objectKey,
      });

      setStage("success");

      return response;
    },

    onError: () => {
      setStage("idle");
    },
  });

  const reset = () => {
    mutation.reset();
    setStage("idle");
  };

  return {
    ...mutation,
    stage,
    reset,
  };
}
