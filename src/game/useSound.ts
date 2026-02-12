import { useRef, useCallback } from 'react';

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

type SoundName = 
  | 'card-play'
  | 'card-attach'
  | 'card-destroy'
  | 'card-draw'
  | 'card-select'
  | 'card-discard'
  | 'caravan-sold'
  | 'turn-change';

type SoundConfig = {
  basePath: string;
  extension: string;
  minIndex: number;
  maxIndex: number;
};

// Map de sons - cada ação pode ter múltiplos arquivos
const soundPaths: Record<SoundName, SoundConfig> = {
  'card-play': { basePath: '/src/assets/sounds/Play', extension: '.wav', minIndex: 1, maxIndex: 3 },
  'card-attach': { basePath: '/src/assets/sounds/Attach', extension: '.wav', minIndex: 1, maxIndex: 4 },
  'card-destroy': { basePath: '/src/assets/sounds/Remove', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'card-draw': { basePath: '/src/assets/sounds/Draw', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'card-select': { basePath: '/src/assets/sounds/Select', extension: '.wav', minIndex: 1, maxIndex: 3 },
  'card-discard': { basePath: '/src/assets/sounds/Discard', extension: '.wav', minIndex: 1, maxIndex: 2 },
  'caravan-sold': { basePath: '/src/assets/sounds/Sold', extension: '.mp3', minIndex: 1, maxIndex: 4 },
  'turn-change': { basePath: '/src/assets/sounds/Turn', extension: '.wav', minIndex: 1, maxIndex: 1 },
};

export function useSound() {
  // Cache: soundName -> array de HTMLAudioElements
  const audioCache = useRef<Map<SoundName, HTMLAudioElement[]>>(new Map());

  // Pré-carregar todos os sons de uma ação
  const preloadSound = useCallback((soundName: SoundName) => {
    if (!audioCache.current.has(soundName)) {
      const config = soundPaths[soundName];
      const audioElements: HTMLAudioElement[] = [];

      // Carregar todos os arquivos do range (minIndex até maxIndex)
      for (let i = config.minIndex; i <= config.maxIndex; i++) {
        const path = `${config.basePath}${i}${config.extension}`;
        const audio = new Audio(path);
        audio.preload = 'auto';
        audioElements.push(audio);
      }

      audioCache.current.set(soundName, audioElements);
    }
  }, []);

  // Tocar um som aleatório do array
  const playSound = useCallback((soundName: SoundName, volume: number = 0.5) => {
    try {
      preloadSound(soundName);
      
      const audioArray = audioCache.current.get(soundName);
      if (audioArray && audioArray.length > 0) {
        // Escolhe aleatoriamente um dos sons disponíveis
        const randomAudio = audioArray[getRandomInt(0, audioArray.length - 1)];
        
        // Clona para permitir múltiplas reproduções simultâneas
        const soundClone = randomAudio.cloneNode() as HTMLAudioElement;
        soundClone.volume = volume;
        soundClone.play().catch(err => {
          console.warn(`Erro ao tocar som ${soundName}:`, err);
        });
      }
    } catch (error) {
      console.warn(`Erro ao processar som ${soundName}:`, error);
    }
  }, [preloadSound]);

  // Pré-carregar todos os sons
  const preloadAllSounds = useCallback(() => {
    Object.keys(soundPaths).forEach(soundName => {
      preloadSound(soundName as SoundName);
    });
  }, [preloadSound]);

  return { playSound, preloadAllSounds };
}