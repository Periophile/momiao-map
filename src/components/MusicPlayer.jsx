import { useRef, useEffect } from 'react';
import CATEGORIES, { ALL_AUDIO } from '../utils/categories';

// Build audio map: category key → audio src
function buildAudioMap() {
  const map = { all: ALL_AUDIO };
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    map[key] = cat.audio;
  });
  return map;
}

const AUDIO_MAP = buildAudioMap();

export default function MusicPlayer() {
  const mediaRef = useRef(null);   // single element: switches src

  // Preload audio map listener
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    function handlePlay(e) {
      const catKey = e.detail; // 'all' | 'food' | 'cigarette' | ...
      const src = AUDIO_MAP[catKey];
      if (!src) return;

      // Stop current immediately
      media.pause();
      // Switch source if different
      if (media.src !== window.location.origin + src) {
        media.src = src;
      }
      media.currentTime = 0;
      media.volume = 0.4;
      // Remove loop
      media.loop = false;
      media.play().catch(() => {});
    }

    window.addEventListener('play-cat-sound', handlePlay);
    return () => window.removeEventListener('play-cat-sound', handlePlay);
  }, []);

  return (
    <video ref={mediaRef} preload="auto" style={{ display: 'none' }} />
  );
}
