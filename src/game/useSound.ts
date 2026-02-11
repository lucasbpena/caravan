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

// Map de sons - você precisará adicionar os arquivos de áudio na pasta /src/assets/sounds/
const soundPaths: Record<SoundName, Array<String | number>> = {
  'card-play': ['/src/assets/sounds/Play', '.wav', 1, 3],
  'card-attach': ['Play', '.wav'],
  'card-destroy': ['Play', '.wav'],
  'card-draw': ['Play', '.wav'],
  'card-select': ['Play', '.wav'],
  'card-discard': ['Play', '.wav'],
  'caravan-sold': ['Sold', '.mp3'],
  'turn-change': ['Play', '.wav'],
};

export function useSound() {
  const audioCache = useRef<Map<SoundName, HTMLAudioElement>>(new Map());

  // Pré-carregar sons
  const preloadSound = useCallback((soundName: SoundName) => {
    if (!audioCache.current.has(soundName)) {
      const audio = new Audio(`${soundPaths[soundName][0]}${getRandomInt(soundPaths[soundName][2] as number, soundPaths[soundName][3] as number)}${soundPaths[soundName][1]}`);
      audio.preload = 'auto';
      audioCache.current.set(soundName, audio);
    }
  }, []);

  // Tocar som
  const playSound = useCallback((soundName: SoundName, volume: number = 0.5) => {
    try {
      // Pré-carregar se ainda não foi carregado
      preloadSound(soundName);
      
      const audio = audioCache.current.get(soundName);
      if (audio) {
        // Clonar o áudio para permitir sobreposição de sons
        const soundClone = audio.cloneNode() as HTMLAudioElement;
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