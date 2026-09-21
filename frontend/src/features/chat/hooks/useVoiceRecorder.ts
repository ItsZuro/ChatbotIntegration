import { useEffect, useRef, useState } from "react";

import { createRealtimeTranscriptionSession } from "../../../services/audio.service";

export type VoiceState = "idle" | "recording" | "transcribing";

interface UseVoiceRecorderOptions {
  onTranscription: (text: string) => void;
}

const WAVEFORM_SIZE = 36;

const createEmptyWaveform = () =>
  Array.from(
    {
      length: WAVEFORM_SIZE,
    },
    () => 0.08,
  );

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function useVoiceRecorder({ onTranscription }: UseVoiceRecorderOptions) {
  const [state, setState] = useState<VoiceState>("idle");

  const [error, setError] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [waveform, setWaveform] = useState<number[]>(createEmptyWaveform);

  const [liveTranscript, setLiveTranscript] = useState("");

  /*
   * ============================
   * REALTIME / WEBRTC
   * ============================
   */

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const audioSenderRef = useRef<RTCRtpSender | null>(null);

  const connectionPromiseRef = useRef<Promise<void> | null>(null);

  const realtimeReadyRef = useRef(false);

  /*
   * ============================
   * MICRÓFONO
   * ============================
   */

  const streamRef = useRef<MediaStream | null>(null);

  const audioTrackRef = useRef<MediaStreamTrack | null>(null);

  /*
   * ============================
   * WAVEFORM
   * ============================
   */

  const audioContextRef = useRef<AudioContext | null>(null);

  const analyserRef = useRef<AnalyserNode | null>(null);

  const animationFrameRef = useRef<number | null>(null);

  const lastWaveformUpdateRef = useRef(0);

  /*
   * ============================
   * TIMER
   * ============================
   */

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const recordingStartedAtRef = useRef<number | null>(null);

  /*
   * ============================
   * TRANSCRIPCIÓN
   * ============================
   */

  const partialTranscriptRef = useRef("");

  const finalizationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const onTranscriptionRef = useRef(onTranscription);

  useEffect(() => {
    onTranscriptionRef.current = onTranscription;
  }, [onTranscription]);

  /*
   * ============================
   * TIMER
   * ============================
   */

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);

      timerRef.current = null;
    }

    recordingStartedAtRef.current = null;
  };

  const startTimer = () => {
    stopTimer();

    setElapsedSeconds(0);

    recordingStartedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const startedAt = recordingStartedAtRef.current;

      if (!startedAt) {
        return;
      }

      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
  };

  /*
   * ============================
   * WAVEFORM
   * ============================
   */

  const stopVisualization = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);

      animationFrameRef.current = null;
    }

    analyserRef.current = null;

    const audioContext = audioContextRef.current;

    audioContextRef.current = null;

    if (audioContext && audioContext.state !== "closed") {
      void audioContext.close();
    }

    setWaveform(createEmptyWaveform());
  };

  const startVisualization = (stream: MediaStream) => {
    stopVisualization();

    const audioContext = new AudioContext();

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;

    analyser.smoothingTimeConstant = 0.7;

    source.connect(analyser);

    audioContextRef.current = audioContext;

    analyserRef.current = analyser;

    const samples = new Uint8Array(analyser.fftSize);

    const updateWaveform = (timestamp: number) => {
      if (timestamp - lastWaveformUpdateRef.current >= 50) {
        analyser.getByteTimeDomainData(samples);

        let sumSquares = 0;

        for (let index = 0; index < samples.length; index += 1) {
          const normalized = (samples[index] - 128) / 128;

          sumSquares += normalized * normalized;
        }

        const rms = Math.sqrt(sumSquares / samples.length);

        const level = Math.min(1, Math.max(0.08, rms * 6));

        setWaveform((current) => [...current.slice(1), level]);

        lastWaveformUpdateRef.current = timestamp;
      }

      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  /*
   * ============================
   * FINALIZACIÓN
   * ============================
   */

  const clearFinalizationTimeout = () => {
    if (finalizationTimeoutRef.current) {
      clearTimeout(finalizationTimeoutRef.current);

      finalizationTimeoutRef.current = null;
    }
  };

  const cleanupMicrophone = async () => {
    stopTimer();

    stopVisualization();

    /*
     * Quitamos la pista del envío,
     * pero NO cerramos WebRTC.
     */
    try {
      await audioSenderRef.current?.replaceTrack(null);
    } catch (exception) {
      console.warn("No se pudo desacoplar el micrófono:", exception);
    }

    audioTrackRef.current?.stop();

    audioTrackRef.current = null;

    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    setElapsedSeconds(0);
  };

  /*
   * ============================
   * CERRAR WEBRTC
   * ============================
   */

  const closeRealtimeConnection = () => {
    realtimeReadyRef.current = false;

    connectionPromiseRef.current = null;

    dataChannelRef.current?.close();

    dataChannelRef.current = null;

    peerConnectionRef.current?.close();

    peerConnectionRef.current = null;

    audioSenderRef.current = null;
  };

  /*
   * ============================
   * RESULTADO
   * ============================
   */

  const finishSuccessfully = async (transcript: string) => {
    const cleanText = transcript.trim();

    clearFinalizationTimeout();

    await cleanupMicrophone();

    partialTranscriptRef.current = "";

    setLiveTranscript("");

    setState("idle");

    if (cleanText) {
      onTranscriptionRef.current(cleanText);
    }
  };

  const failRecording = async (message: string) => {
    clearFinalizationTimeout();

    await cleanupMicrophone();

    partialTranscriptRef.current = "";

    setLiveTranscript("");

    setError(message);

    setState("idle");
  };

  /*
   * ============================
   * EVENTOS OPENAI
   * ============================
   */

  const handleRealtimeEvent = (rawData: string) => {
    let parsed: unknown;

    try {
      parsed = JSON.parse(rawData);
    } catch {
      return;
    }

    if (!isRecord(parsed)) {
      return;
    }

    const event = parsed;

    if (event.type === "conversation.item.input_audio_transcription.delta") {
      const delta = typeof event.delta === "string" ? event.delta : "";

      partialTranscriptRef.current += delta;

      setLiveTranscript(partialTranscriptRef.current);

      return;
    }

    if (
      event.type === "conversation.item.input_audio_transcription.completed"
    ) {
      const transcript =
        typeof event.transcript === "string"
          ? event.transcript
          : partialTranscriptRef.current;

      void finishSuccessfully(transcript);

      return;
    }

    if (event.type === "error") {
      console.error("Realtime OpenAI error:", event);

      void failRecording("La sesión de voz produjo un error.");
    }
  };

  /*
   * ============================
   * PRECALENTAR WEBRTC
   * ============================
   */
  const ensureRealtimeConnection = async () => {
    if (
      realtimeReadyRef.current &&
      dataChannelRef.current?.readyState === "open" &&
      peerConnectionRef.current?.connectionState === "connected"
    ) {
      return;
    }

    /*
     * Si ya hay una conexión
     * preparándose, reutilizamos
     * exactamente la misma promesa.
     */
    if (connectionPromiseRef.current) {
      return connectionPromiseRef.current;
    }

    /*
     * Usamos una función async normal
     * en lugar de un async executor
     * dentro de new Promise().
     */
    const connectionPromise = (async () => {
      closeRealtimeConnection();

      /*
       * 1. Secreto efímero
       * desde FastAPI.
       */
      const session = await createRealtimeTranscriptionSession();

      /*
       * 2. PeerConnection.
       */
      const peerConnection = new RTCPeerConnection();

      peerConnectionRef.current = peerConnection;

      /*
       * 3. Reservamos desde ahora
       * un sender de audio.
       *
       * Todavía NO activamos
       * ningún micrófono.
       */
      const transceiver = peerConnection.addTransceiver("audio", {
        direction: "sendonly",
      });

      audioSenderRef.current = transceiver.sender;

      /*
       * 4. Canal de eventos
       * de OpenAI.
       */
      const dataChannel = peerConnection.createDataChannel("oai-events");

      dataChannelRef.current = dataChannel;

      dataChannel.onmessage = (messageEvent) => {
        if (typeof messageEvent.data === "string") {
          handleRealtimeEvent(messageEvent.data);
        }
      };

      dataChannel.onerror = (event) => {
        console.error("Realtime data channel error:", event);
      };

      dataChannel.onclose = () => {
        realtimeReadyRef.current = false;
      };

      peerConnection.onconnectionstatechange = () => {
        const connectionState = peerConnection.connectionState;

        if (
          connectionState === "failed" ||
          connectionState === "closed" ||
          connectionState === "disconnected"
        ) {
          realtimeReadyRef.current = false;
        }
      };

      /*
       * Creamos esta promesa SOLO
       * para esperar el evento
       * "open".
       *
       * Su executor NO es async.
       */
      const waitForDataChannel = new Promise<void>((resolve, reject) => {
        if (dataChannel.readyState === "open") {
          resolve();

          return;
        }

        const handleOpen = () => {
          cleanupListeners();

          resolve();
        };

        const handleError = () => {
          cleanupListeners();

          reject(new Error("No se pudo abrir el canal de datos de OpenAI."));
        };

        const handleClose = () => {
          cleanupListeners();

          reject(new Error("El canal de datos se cerró antes de estar listo."));
        };

        const cleanupListeners = () => {
          dataChannel.removeEventListener("open", handleOpen);

          dataChannel.removeEventListener("error", handleError);

          dataChannel.removeEventListener("close", handleClose);
        };

        dataChannel.addEventListener("open", handleOpen);

        dataChannel.addEventListener("error", handleError);

        dataChannel.addEventListener("close", handleClose);
      });

      /*
       * 5. Oferta SDP.
       */
      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      if (!offer.sdp) {
        throw new Error("No se pudo crear la oferta WebRTC.");
      }

      /*
       * 6. Negociación con OpenAI.
       */
      const sdpResponse = await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${session.client_secret}`,

            "Content-Type": "application/sdp",
          },

          body: offer.sdp,
        },
      );

      if (!sdpResponse.ok) {
        const details = await sdpResponse.text();

        console.error("Realtime SDP error:", details);

        throw new Error("OpenAI rechazó la conexión WebRTC.");
      }

      const answerSdp = await sdpResponse.text();

      await peerConnection.setRemoteDescription({
        type: "answer",

        sdp: answerSdp,
      });

      /*
       * 7. Esperamos hasta que
       * OpenAI abra realmente
       * el DataChannel.
       */
      await waitForDataChannel;

      realtimeReadyRef.current = true;
    })();

    connectionPromiseRef.current = connectionPromise;

    try {
      await connectionPromise;
    } catch (exception) {
      closeRealtimeConnection();

      throw exception;
    } finally {
      /*
       * Solo limpiamos la referencia
       * si sigue correspondiendo
       * a esta misma conexión.
       */
      if (connectionPromiseRef.current === connectionPromise) {
        connectionPromiseRef.current = null;
      }
    }
  };

  /*
   * ============================
   * INICIAR GRABACIÓN
   * ============================
   */

  const startRecording = async () => {
    if (state !== "idle") {
      return;
    }

    setError(null);

    setLiveTranscript("");

    partialTranscriptRef.current = "";

    try {
      /*
       * Normalmente WebRTC ya estará
       * listo gracias al precalentado.
       *
       * Si no lo está, lo terminamos
       * de conectar EN PARALELO con
       * el permiso del micrófono.
       */
      const [stream] = await Promise.all([
        navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,

            noiseSuppression: true,

            autoGainControl: true,

            channelCount: 1,
          },
        }),

        ensureRealtimeConnection(),
      ]);

      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];

      if (!audioTrack) {
        throw new Error("No se encontró una pista de audio.");
      }

      audioTrackRef.current = audioTrack;

      const dataChannel = dataChannelRef.current;

      const audioSender = audioSenderRef.current;

      if (!dataChannel || dataChannel.readyState !== "open" || !audioSender) {
        throw new Error("La sesión de voz todavía no está disponible.");
      }

      /*
       * Limpiamos cualquier resto
       * del turno anterior.
       */
      dataChannel.send(
        JSON.stringify({
          type: "input_audio_buffer.clear",
        }),
      );

      /*
       * ACÁ empieza realmente
       * la transmisión.
       *
       * Como WebRTC YA está conectado,
       * no hay otra negociación SDP.
       */
      await audioSender.replaceTrack(audioTrack);

      startTimer();

      startVisualization(stream);

      setState("recording");
    } catch (exception) {
      console.error("Realtime voice start error:", exception);

      await cleanupMicrophone();

      /*
       * Si la conexión vieja falló,
       * la cerramos para que el
       * siguiente intento cree otra.
       */
      if (!realtimeReadyRef.current) {
        closeRealtimeConnection();
      }

      setError("No se pudo iniciar el micrófono en tiempo real.");

      setState("idle");
    }
  };

  /*
   * ============================
   * DETENER
   * ============================
   */

  const stopRecording = async () => {
    if (state !== "recording") {
      return;
    }

    const dataChannel = dataChannelRef.current;

    /*
     * Dejamos de transmitir
     * inmediatamente.
     */
    await audioSenderRef.current?.replaceTrack(null);

    audioTrackRef.current?.stop();

    audioTrackRef.current = null;

    streamRef.current = null;

    stopTimer();

    stopVisualization();

    setState("transcribing");

    if (!dataChannel || dataChannel.readyState !== "open") {
      await failRecording("Se perdió la conexión de voz.");

      closeRealtimeConnection();

      return;
    }

    /*
     * Confirmamos el turno.
     */
    dataChannel.send(
      JSON.stringify({
        type: "input_audio_buffer.commit",
      }),
    );

    clearFinalizationTimeout();

    finalizationTimeoutRef.current = setTimeout(() => {
      const partial = partialTranscriptRef.current.trim();

      if (partial) {
        void finishSuccessfully(partial);

        return;
      }

      void failRecording("No se recibió una transcripción final.");
    }, 10_000);
  };

  /*
   * ============================
   * CANCELAR
   * ============================
   */

  const cancelRecording = async () => {
    if (state === "idle") {
      return;
    }

    await cleanupMicrophone();

    const dataChannel = dataChannelRef.current;

    if (dataChannel && dataChannel.readyState === "open") {
      dataChannel.send(
        JSON.stringify({
          type: "input_audio_buffer.clear",
        }),
      );
    }

    partialTranscriptRef.current = "";

    setLiveTranscript("");

    setState("idle");
  };

  /*
   * ============================
   * TOGGLE
   * ============================
   */

  const toggleRecording = async () => {
    if (state === "recording") {
      await stopRecording();

      return;
    }

    if (state === "idle") {
      await startRecording();
    }
  };

  /*
   * ============================
   * PREWARM
   * ============================
   *
   * Esto ocurre apenas se monta
   * el hook. No activa el
   * micrófono.
   */
  useEffect(() => {
    void ensureRealtimeConnection().catch((exception) => {
      /*
       * No mostramos notificación:
       * si el precalentado falla,
       * startRecording volverá
       * a intentarlo al pulsar 🎙.
       */
      console.warn("Realtime prewarm failed:", exception);
    });

    return () => {
      void cleanupMicrophone();

      closeRealtimeConnection();
    };
  }, []);

  return {
    state,
    error,

    elapsedSeconds,
    waveform,
    liveTranscript,

    isRecording: state === "recording",

    isTranscribing: state === "transcribing",

    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  };
}
