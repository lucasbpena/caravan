import { useRef, useCallback } from 'react';

function getRandomInt(min: number, max: number) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

export type SoundName =
  | 'card-play'
  | 'card-attach'
  | 'card-destroy'
  | 'card-draw'
  | 'card-select'
  | 'card-discard'
  | 'caravan-sold'
  | 'caravan-overburden'
  | 'caravan-contest'
  | 'turn-change'
  | 'victory'
  | 'defeat';

type SoundConfig = {
  basePath: string;
  extension: string;
  minIndex: number;
  maxIndex: number;
};

const soundPaths: Record<SoundName, SoundConfig> = {
  'card-play': { basePath: '/src/assets/sounds/Play', extension: '.wav', minIndex: 1, maxIndex: 3 },
  'card-attach': { basePath: '/src/assets/sounds/Attach', extension: '.wav', minIndex: 1, maxIndex: 4 },
  'card-destroy': { basePath: '/src/assets/sounds/Remove', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'card-draw': { basePath: '/src/assets/sounds/Draw', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'card-select': { basePath: '/src/assets/sounds/Ok', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'card-discard': { basePath: '/src/assets/sounds/Discard', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'caravan-sold': { basePath: '/src/assets/sounds/Sold', extension: '.mp3', minIndex: 1, maxIndex: 1 },
  'caravan-overburden': { basePath: '/src/assets/sounds/Overburden', extension: '.mp3', minIndex: 1, maxIndex: 2 },
  'caravan-contest': { basePath: '/src/assets/sounds/Contest', extension: '.mp3', minIndex: 1, maxIndex: 1 },
  'turn-change': { basePath: '/src/assets/sounds/Turn', extension: '.wav', minIndex: 1, maxIndex: 1 },
  'victory': { basePath: '/src/assets/sounds/Victory', extension: '.mp3', minIndex: 1, maxIndex: 4 },
  'defeat': { basePath: '/src/assets/sounds/Defeat', extension: '.mp3', minIndex: 1, maxIndex: 3 },
};

export function useSound() {
  const audioCache = useRef<Map<SoundName, HTMLAudioElement[]>>(new Map());

  const preloadSound = useCallback((soundName?: SoundName) => {
    if (!soundName) return;

    if (audioCache.current.has(soundName)) return;

    const config = soundPaths[soundName];
    if (!config) {
      console.warn(`Som não configurado: ${soundName}`);
      return;
    }

    const audioElements: HTMLAudioElement[] = [];

    for (let i = config.minIndex; i <= config.maxIndex; i++) {
      const path = `${config.basePath}${i}${config.extension}`;
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioElements.push(audio);
    }

    audioCache.current.set(soundName, audioElements);
  }, []);

  const playSound = useCallback(
    (soundName?: SoundName, volume: number = 0.5) => {
      if (!soundName) return;

      try {
        preloadSound(soundName);

        const audioArray = audioCache.current.get(soundName);
        if (!audioArray || audioArray.length === 0) return;

        const randomAudio =
          audioArray[getRandomInt(0, audioArray.length - 1)];

        const soundClone = randomAudio.cloneNode(true) as HTMLAudioElement;
        soundClone.volume = volume;

        void soundClone.play().catch(err => {
          console.warn(`Erro ao tocar som ${soundName}:`, err);
        });

      } catch (error) {
        console.warn(`Erro ao processar som ${soundName}:`, error);
      }
    },
    [preloadSound]
  );

  const preloadAllSounds = useCallback(() => {
    (Object.keys(soundPaths) as SoundName[]).forEach(soundName => {
      preloadSound(soundName);
    });
  }, [preloadSound]);

  return { playSound, preloadAllSounds };
}