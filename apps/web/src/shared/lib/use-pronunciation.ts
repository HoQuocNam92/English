'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';

/** Keep one player per surface and discard responses after navigation or cancellation. */
export function usePronunciation() {
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const player = useRef<HTMLAudioElement | null>(null);
  const request = useRef(0);
  const stop = useCallback(() => {
    request.current++;
    player.current?.pause();
    player.current = null;
    setSpeaking(false);
    setSpeechError('');
  }, []);
  const play = useCallback(async (text: string, audioUrl?: string | null) => {
    const version = ++request.current;
    player.current?.pause();
    setSpeaking(true);
    setSpeechError('');
    const playSource = async (source: string) => {
      if (version !== request.current) return;
      const audio = new Audio(source);
      player.current = audio;
      audio.onended = () => { if (version === request.current) setSpeaking(false); };
      // Also handle decoding/network errors that occur after play() resolves.
      audio.onerror = () => { if (version === request.current) { setSpeaking(false); setSpeechError('Không phát được âm thanh. Vui lòng thử lại.'); } };
      await audio.play();
    };
    try {
      if (audioUrl) {
        try { await playSource(audioUrl); return; } catch (cause) {
          if (cause instanceof Error && cause.name === 'NotAllowedError') throw cause;
        }
      }
      const data = await apiClient.post<{ audio: string; mimeType: string }>('/translation/pronunciation', { text });
      if (version !== request.current) return;
      setSpeechError('');
      setSpeaking(true);
      await playSource(`data:${data.mimeType};base64,${data.audio}`);
    } catch (cause) {
      if (version === request.current) {
        setSpeaking(false);
        setSpeechError(cause instanceof Error && cause.name === 'NotAllowedError'
          ? 'Trình duyệt đang chặn âm thanh. Cho phép âm thanh cho trang này rồi thử lại.'
          : 'Chưa phát được âm thanh. Vui lòng thử lại.');
      }
    }
  }, []);
  useEffect(() => () => { request.current++; player.current?.pause(); }, []);
  return { speaking, speechError, play, stop };
}
