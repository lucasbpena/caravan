import type { Card } from '../game/types';
import './Card.css';

import { motion } from 'framer-motion';


export function getCardDisplacement(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const rand = (min: number, max: number) =>
    min + (Math.abs(hash) % 1000) / 1000 * (max - min);

  return {
    x: rand(-4, 4),
    y: rand(-2, 2),
    rotate: rand(-5, 5),
  };
}

// Import card images
const cardModules = import.meta.glob('../assets/vector-cards/*', {
  eager: true,
  as: 'url',
});

export const cardPaths: Record<string, string> = Object.fromEntries(
  Object.entries(cardModules).map(([path, module]) => {
    const filename = path
      .split('/')
      .pop()!
      .replace(/\.\w+$/, '');

    return [filename, module];
  })
);


type CardViewProps = {
  card: Card;
  onClick?: () => void;
  onDestroyAnimationComplete?: () => void;
};


export const CardView = ({
  card,
  onClick,
  onDestroyAnimationComplete,
}: CardViewProps) => {
  return (
    <motion.div
      className="card"
      
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      animate={
        card.cardStatus === 'destroying'
          ? { scale: 0.2, rotate: 20, opacity: 0 }
          : { scale: 1, rotate: 0, opacity: 1 }
      }
      transition={{ duration: 3, ease: 'easeInOut' }}
      onAnimationComplete={() => {
        if (card.cardStatus === 'destroying') {
          onDestroyAnimationComplete?.();
        }
      }}
    >
      <div className="card-root">
        <img
          src={cardPaths[`${card.value}_${card.suit}`]}
          className="card-face"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};