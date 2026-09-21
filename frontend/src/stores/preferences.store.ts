import { create } from "zustand";
import { persist } from "zustand/middleware";


interface PreferencesState {
  autoSendVoice: boolean;

  setAutoSendVoice: (
    value: boolean
  ) => void;
}


export const usePreferencesStore =
  create<PreferencesState>()(
    persist(
      (set) => ({
        autoSendVoice: false,

        setAutoSendVoice: (
          value
        ) => {
          set({
            autoSendVoice: value,
          });
        },
      }),
      {
        name:
          "utp-assistant-preferences",
      }
    )
  );