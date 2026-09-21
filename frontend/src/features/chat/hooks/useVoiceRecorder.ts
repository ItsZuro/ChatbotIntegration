import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createRealtimeTranscriptionSession,
} from "../../../services/audio.service";

import type {
  RealtimeTranscriptionSessionResponse,
} from "../../../types/api.types";


export type VoiceState =
  | "idle"
  | "recording"
  | "transcribing";


interface UseVoiceRecorderOptions {
  onTranscription: (
    text: string
  ) => void;
}


const WAVEFORM_SIZE = 36;


const createEmptyWaveform = () =>
  Array.from(
    {
      length: WAVEFORM_SIZE,
    },
    () => 0.08,
  );


function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}


function getRealtimeErrorMessage(
  event: Record<string, unknown>,
) {
  const error = event.error;

  if (
    isRecord(error) &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "La sesión de voz produjo un error.";
}


export function useVoiceRecorder({
  onTranscription,
}: UseVoiceRecorderOptions) {
  const [
    state,
    setState,
  ] =
    useState<VoiceState>(
      "idle",
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] =
    useState(0);


  const [
    waveform,
    setWaveform,
  ] =
    useState<number[]>(
      createEmptyWaveform,
    );


  const [
    liveTranscript,
    setLiveTranscript,
  ] =
    useState("");


  /*
   * ============================
   * REALTIME
   * ============================
   */

  const peerConnectionRef =
    useRef<RTCPeerConnection | null>(
      null,
    );


  const dataChannelRef =
    useRef<RTCDataChannel | null>(
      null,
    );


  const audioSenderRef =
    useRef<RTCRtpSender | null>(
      null,
    );


  const realtimeReadyRef =
    useRef(false);


  /*
   * Precargamos ÚNICAMENTE
   * el secreto efímero.
   *
   * No creamos WebRTC sin
   * una pista real.
   */
  const sessionRef =
    useRef<RealtimeTranscriptionSessionResponse | null>(
      null,
    );


  const sessionPromiseRef =
    useRef<Promise<RealtimeTranscriptionSessionResponse> | null>(
      null,
    );


  /*
   * ============================
   * MICRÓFONO
   * ============================
   */

  const streamRef =
    useRef<MediaStream | null>(
      null,
    );


  const audioTrackRef =
    useRef<MediaStreamTrack | null>(
      null,
    );


  /*
   * ============================
   * VISUALIZACIÓN
   * ============================
   */

  const audioContextRef =
    useRef<AudioContext | null>(
      null,
    );


  const animationFrameRef =
    useRef<number | null>(
      null,
    );


  const lastWaveformUpdateRef =
    useRef(0);


  /*
   * ============================
   * TIMER
   * ============================
   */

  const timerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);


  const recordingStartedAtRef =
    useRef<number | null>(
      null,
    );


  /*
   * ============================
   * TRANSCRIPCIÓN
   * ============================
   */

  const partialTranscriptRef =
    useRef("");


  const finalizationTimeoutRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);


  const onTranscriptionRef =
    useRef(
      onTranscription,
    );


  useEffect(() => {
    onTranscriptionRef.current =
      onTranscription;
  }, [
    onTranscription,
  ]);


  /*
   * ============================
   * TOKEN EFÍMERO
   * ============================
   */

  const getRealtimeSession =
    async () => {
      const cached =
        sessionRef.current;


      const now =
        Math.floor(
          Date.now() / 1000,
        );


      /*
       * Dejamos 10 s de margen
       * antes de que expire.
       */
      if (
        cached &&
        cached.expires_at >
          now + 10
      ) {
        return cached;
      }


      if (
        sessionPromiseRef.current
      ) {
        return sessionPromiseRef
          .current;
      }


      const promise =
        createRealtimeTranscriptionSession();


      sessionPromiseRef.current =
        promise;


      try {
        const session =
          await promise;


        sessionRef.current =
          session;


        return session;
      } finally {
        if (
          sessionPromiseRef.current ===
          promise
        ) {
          sessionPromiseRef.current =
            null;
        }
      }
    };


  /*
   * ============================
   * TIMER
   * ============================
   */

  const stopTimer = () => {
    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current,
      );

      timerRef.current =
        null;
    }


    recordingStartedAtRef.current =
      null;
  };


  const startTimer = () => {
    stopTimer();


    setElapsedSeconds(
      0,
    );


    recordingStartedAtRef.current =
      Date.now();


    timerRef.current =
      setInterval(
        () => {
          const startedAt =
            recordingStartedAtRef
              .current;


          if (
            !startedAt
          ) {
            return;
          }


          setElapsedSeconds(
            Math.floor(
              (
                Date.now() -
                startedAt
              ) / 1000,
            ),
          );
        },
        250,
      );
  };


  /*
   * ============================
   * WAVEFORM
   * ============================
   */

  const stopVisualization =
    () => {
      if (
        animationFrameRef.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current,
        );

        animationFrameRef.current =
          null;
      }


      const audioContext =
        audioContextRef.current;


      audioContextRef.current =
        null;


      if (
        audioContext &&
        audioContext.state !==
          "closed"
      ) {
        void audioContext.close();
      }


      setWaveform(
        createEmptyWaveform(),
      );
    };


  const startVisualization = (
    stream: MediaStream,
  ) => {
    stopVisualization();


    const audioContext =
      new AudioContext();


    const source =
      audioContext
        .createMediaStreamSource(
          stream,
        );


    const analyser =
      audioContext
        .createAnalyser();


    analyser.fftSize =
      512;


    analyser.smoothingTimeConstant =
      0.7;


    source.connect(
      analyser,
    );


    audioContextRef.current =
      audioContext;


    const samples =
      new Uint8Array(
        analyser.fftSize,
      );


    const updateWaveform = (
      timestamp: number,
    ) => {
      if (
        timestamp -
          lastWaveformUpdateRef
            .current >=
        50
      ) {
        analyser
          .getByteTimeDomainData(
            samples,
          );


        let sumSquares =
          0;


        for (
          let index = 0;
          index <
          samples.length;
          index += 1
        ) {
          const normalized =
            (
              samples[index] -
              128
            ) / 128;


          sumSquares +=
            normalized *
            normalized;
        }


        const rms =
          Math.sqrt(
            sumSquares /
              samples.length,
          );


        const level =
          Math.min(
            1,
            Math.max(
              0.08,
              rms * 6,
            ),
          );


        setWaveform(
          (
            current,
          ) => [
            ...current.slice(
              1,
            ),

            level,
          ],
        );


        lastWaveformUpdateRef.current =
          timestamp;
      }


      animationFrameRef.current =
        requestAnimationFrame(
          updateWaveform,
        );
    };


    animationFrameRef.current =
      requestAnimationFrame(
        updateWaveform,
      );
  };


  /*
   * ============================
   * MICRÓFONO
   * ============================
   */

  const stopLocalMicrophone =
    () => {
      stopTimer();

      stopVisualization();


      audioTrackRef.current
        ?.stop();


      audioTrackRef.current =
        null;


      streamRef.current
        ?.getTracks()
        .forEach(
          (
            track,
          ) => {
            track.stop();
          },
        );


      streamRef.current =
        null;


      setElapsedSeconds(
        0,
      );
    };


  /*
   * ============================
   * WEBRTC
   * ============================
   */

  const closeRealtimeConnection =
    () => {
      realtimeReadyRef.current =
        false;


      dataChannelRef.current
        ?.close();


      dataChannelRef.current =
        null;


      peerConnectionRef.current
        ?.close();


      peerConnectionRef.current =
        null;


      audioSenderRef.current =
        null;
    };


  const waitForDataChannelOpen = (
    dataChannel: RTCDataChannel,
  ) =>
    new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        if (
          dataChannel.readyState ===
          "open"
        ) {
          resolve();

          return;
        }


        const handleOpen =
          () => {
            cleanup();

            resolve();
          };


        const handleError =
          () => {
            cleanup();

            reject(
              new Error(
                "No se pudo abrir el canal de datos.",
              ),
            );
          };


        const handleClose =
          () => {
            cleanup();

            reject(
              new Error(
                "El canal de datos se cerró.",
              ),
            );
          };


        const cleanup =
          () => {
            dataChannel
              .removeEventListener(
                "open",
                handleOpen,
              );


            dataChannel
              .removeEventListener(
                "error",
                handleError,
              );


            dataChannel
              .removeEventListener(
                "close",
                handleClose,
              );
          };


        dataChannel
          .addEventListener(
            "open",
            handleOpen,
          );


        dataChannel
          .addEventListener(
            "error",
            handleError,
          );


        dataChannel
          .addEventListener(
            "close",
            handleClose,
          );
      },
    );


  /*
   * ============================
   * RESULTADOS
   * ============================
   */

  const clearFinalizationTimeout =
    () => {
      if (
        finalizationTimeoutRef
          .current
      ) {
        clearTimeout(
          finalizationTimeoutRef
            .current,
        );


        finalizationTimeoutRef.current =
          null;
      }
    };


  const finishSuccessfully = (
    transcript: string,
  ) => {
    const cleanText =
      transcript.trim();


    clearFinalizationTimeout();


    stopLocalMicrophone();


    partialTranscriptRef.current =
      "";


    setLiveTranscript(
      "",
    );


    setState(
      "idle",
    );


    if (
      cleanText
    ) {
      onTranscriptionRef
        .current(
          cleanText,
        );
    }
  };


  const failRecording = (
    message: string,
  ) => {
    clearFinalizationTimeout();


    stopLocalMicrophone();


    partialTranscriptRef.current =
      "";


    setLiveTranscript(
      "",
    );


    setError(
      message,
    );


    setState(
      "idle",
    );
  };


  /*
   * ============================
   * EVENTOS DE OPENAI
   * ============================
   */

  const handleRealtimeEvent = (
    rawData: string,
  ) => {
    let parsed:
      unknown;


    try {
      parsed =
        JSON.parse(
          rawData,
        );
    } catch {
      return;
    }


    if (
      !isRecord(
        parsed,
      )
    ) {
      return;
    }


    const event =
      parsed;


    /*
     * Temporalmente lo dejamos
     * para diagnosticar Realtime.
     */
    console.debug(
      "[OpenAI Realtime]",
      event.type,
      event,
    );


    if (
      event.type ===
      "conversation.item.input_audio_transcription.delta"
    ) {
      const delta =
        typeof event.delta ===
        "string"
          ? event.delta
          : "";


      partialTranscriptRef.current +=
        delta;


      setLiveTranscript(
        partialTranscriptRef
          .current,
      );


      return;
    }


    if (
      event.type ===
      "conversation.item.input_audio_transcription.completed"
    ) {
      const transcript =
        typeof event.transcript ===
        "string"
          ? event.transcript
          : partialTranscriptRef
              .current;


      finishSuccessfully(
        transcript,
      );


      return;
    }


    if (
      event.type ===
      "error"
    ) {
      const message =
        getRealtimeErrorMessage(
          event,
        );


      console.error(
        "OpenAI Realtime error:",
        event,
      );


      failRecording(
        message,
      );
    }
  };


  /*
   * ============================
   * PRIMERA CONEXIÓN
   * ============================
   *
   * MUY IMPORTANTE:
   * la pista real se añade ANTES
   * de crear la oferta SDP.
   */
  const connectRealtime = async (
    stream: MediaStream,
    audioTrack: MediaStreamTrack,
  ) => {
    const session =
      await getRealtimeSession();


    const peerConnection =
      new RTCPeerConnection();


    peerConnectionRef.current =
      peerConnection;


    /*
     * La pista real forma parte
     * de la negociación SDP.
     */
    const sender =
      peerConnection
        .addTrack(
          audioTrack,
          stream,
        );


    audioSenderRef.current =
      sender;


    /*
     * Todavía no enviamos voz.
     * La pista existe para SDP,
     * pero permanece silenciada
     * hasta abrir el canal.
     */
    audioTrack.enabled =
      false;


    const dataChannel =
      peerConnection
        .createDataChannel(
          "oai-events",
        );


    dataChannelRef.current =
      dataChannel;


    dataChannel.onmessage =
      (
        messageEvent,
      ) => {
        if (
          typeof messageEvent
            .data ===
          "string"
        ) {
          handleRealtimeEvent(
            messageEvent.data,
          );
        }
      };


    dataChannel.onerror =
      (
        event,
      ) => {
        console.error(
          "Realtime data channel error:",
          event,
        );
      };


    dataChannel.onclose =
      () => {
        realtimeReadyRef.current =
          false;
      };


    peerConnection
      .onconnectionstatechange =
      () => {
        const connectionState =
          peerConnection
            .connectionState;


        console.debug(
          "[WebRTC]",
          connectionState,
        );


        if (
          connectionState ===
            "failed" ||
          connectionState ===
            "closed" ||
          connectionState ===
            "disconnected"
        ) {
          realtimeReadyRef.current =
            false;
        }
      };


    const waitForOpen =
      waitForDataChannelOpen(
        dataChannel,
      );


    const offer =
      await peerConnection
        .createOffer();


    await peerConnection
      .setLocalDescription(
        offer,
      );


    if (
      !offer.sdp
    ) {
      throw new Error(
        "No se pudo crear la oferta WebRTC.",
      );
    }


    const sdpResponse =
      await fetch(
        "https://api.openai.com/v1/realtime/calls",
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${session.client_secret}`,

            "Content-Type":
              "application/sdp",
          },

          body:
            offer.sdp,
        },
      );


    if (
      !sdpResponse.ok
    ) {
      const details =
        await sdpResponse
          .text();


      console.error(
        "Realtime SDP error:",
        details,
      );


      throw new Error(
        "OpenAI rechazó la conexión WebRTC.",
      );
    }


    const answerSdp =
      await sdpResponse
        .text();


    await peerConnection
      .setRemoteDescription({
        type:
          "answer",

        sdp:
          answerSdp,
      });


    await waitForOpen;


    realtimeReadyRef.current =
      true;
  };


  /*
   * ============================
   * INICIAR GRABACIÓN
   * ============================
   */

  const startRecording =
    async () => {
      if (
        state !==
        "idle"
      ) {
        return;
      }


      setError(
        null,
      );


      setLiveTranscript(
        "",
      );


      partialTranscriptRef.current =
        "";


      try {
        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio: {
                echoCancellation:
                  true,

                noiseSuppression:
                  true,

                autoGainControl:
                  true,

                channelCount:
                  1,
              },
            });


        streamRef.current =
          stream;


        const audioTrack =
          stream
            .getAudioTracks()[0];


        if (
          !audioTrack
        ) {
          throw new Error(
            "No se encontró una pista de audio.",
          );
        }


        audioTrackRef.current =
          audioTrack;


        const dataChannel =
          dataChannelRef.current;


        /*
         * Si ya tenemos una sesión
         * WebRTC real negociada desde
         * una grabación anterior,
         * simplemente cambiamos la pista.
         */
        if (
          realtimeReadyRef.current &&
          dataChannel &&
          dataChannel.readyState ===
            "open" &&
          audioSenderRef.current
        ) {
          audioTrack.enabled =
            false;


          dataChannel.send(
            JSON.stringify({
              type:
                "input_audio_buffer.clear",
            }),
          );


          await audioSenderRef
            .current
            .replaceTrack(
              audioTrack,
            );


          audioTrack.enabled =
            true;


          startTimer();


          startVisualization(
            stream,
          );


          setState(
            "recording",
          );


          return;
        }


        /*
         * Primera grabación:
         * negociamos WebRTC CON
         * la pista real.
         */
        closeRealtimeConnection();


        await connectRealtime(
          stream,
          audioTrack,
        );


        const connectedDataChannel =
          dataChannelRef.current;


        if (
          !connectedDataChannel ||
          connectedDataChannel
            .readyState !==
            "open"
        ) {
          throw new Error(
            "El canal Realtime no quedó disponible.",
          );
        }


        /*
         * Limpiamos cualquier silencio
         * acumulado durante el handshake.
         */
        connectedDataChannel.send(
          JSON.stringify({
            type:
              "input_audio_buffer.clear",
          }),
        );


        /*
         * DESDE AQUÍ sí estamos
         * realmente escuchando.
         */
        audioTrack.enabled =
          true;


        startTimer();


        startVisualization(
          stream,
        );


        setState(
          "recording",
        );
      } catch (
        exception
      ) {
        console.error(
          "Realtime voice start error:",
          exception,
        );


        stopLocalMicrophone();


        closeRealtimeConnection();


        setError(
          "No se pudo iniciar la transcripción en tiempo real.",
        );


        setState(
          "idle",
        );
      }
    };


  /*
   * ============================
   * DETENER
   * ============================
   */

  const stopRecording =
    async () => {
      if (
        state !==
        "recording"
      ) {
        return;
      }


      const dataChannel =
        dataChannelRef.current;


      const audioTrack =
        audioTrackRef.current;


      /*
       * Primero dejamos de enviar
       * audio nuevo.
       */
      if (
        audioTrack
      ) {
        audioTrack.enabled =
          false;
      }


      try {
        await audioSenderRef
          .current
          ?.replaceTrack(
            null,
          );
      } catch (
        exception
      ) {
        console.warn(
          "No se pudo desacoplar la pista:",
          exception,
        );
      }


      stopLocalMicrophone();


      setState(
        "transcribing",
      );


      if (
        !dataChannel ||
        dataChannel.readyState !==
          "open"
      ) {
        failRecording(
          "Se perdió la conexión de voz.",
        );


        closeRealtimeConnection();


        return;
      }


      /*
       * En WebRTC con VAD apagado,
       * commit finaliza el turno.
       */
      dataChannel.send(
        JSON.stringify({
          type:
            "input_audio_buffer.commit",
        }),
      );


      clearFinalizationTimeout();


      finalizationTimeoutRef.current =
        setTimeout(
          () => {
            const partial =
              partialTranscriptRef
                .current
                .trim();


            if (
              partial
            ) {
              finishSuccessfully(
                partial,
              );

              return;
            }


            failRecording(
              "OpenAI no devolvió una transcripción para este audio.",
            );
          },
          10_000,
        );
    };


  /*
   * ============================
   * CANCELAR
   * ============================
   */

  const cancelRecording =
    async () => {
      if (
        state ===
        "idle"
      ) {
        return;
      }


      const track =
        audioTrackRef.current;


      if (
        track
      ) {
        track.enabled =
          false;
      }


      try {
        await audioSenderRef
          .current
          ?.replaceTrack(
            null,
          );
      } catch {
        // Nada que hacer.
      }


      stopLocalMicrophone();


      const dataChannel =
        dataChannelRef.current;


      if (
        dataChannel &&
        dataChannel.readyState ===
          "open"
      ) {
        dataChannel.send(
          JSON.stringify({
            type:
              "input_audio_buffer.clear",
          }),
        );
      }


      clearFinalizationTimeout();


      partialTranscriptRef.current =
        "";


      setLiveTranscript(
        "",
      );


      setState(
        "idle",
      );
    };


  /*
   * ============================
   * TOGGLE
   * ============================
   */

  const toggleRecording =
    async () => {
      if (
        state ===
        "recording"
      ) {
        await stopRecording();

        return;
      }


      if (
        state ===
        "idle"
      ) {
        await startRecording();
      }
    };


  /*
   * ============================
   * PRECARGA
   * ============================
   *
   * Solo obtiene el secreto.
   * NO abre micrófono.
   * NO crea WebRTC.
   */
  useEffect(() => {
    void getRealtimeSession()
      .catch(
        (
          exception,
        ) => {
          console.warn(
            "No se pudo precargar la sesión Realtime:",
            exception,
          );
        },
      );


    return () => {
      clearFinalizationTimeout();

      stopLocalMicrophone();

      closeRealtimeConnection();
    };
  }, []);


  return {
    state,
    error,

    elapsedSeconds,
    waveform,
    liveTranscript,

    isRecording:
      state ===
      "recording",

    isTranscribing:
      state ===
      "transcribing",

    startRecording,
    stopRecording,
    cancelRecording,
    toggleRecording,
  };
}