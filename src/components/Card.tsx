import './Card.css';
import cardBackBlue from '../assets/1800-cards/back-blue.png'

import { isFaceCard, type Card } from '../game/types';

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
const cardModules = import.meta.glob('../assets/1800-cards/*', {
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
  turned?: boolean;
  disableDisplacement?: boolean;
  className?: string;
};


export const CardView = ({
  card,
  onClick,
  onDestroyAnimationComplete,
  turned,
  disableDisplacement = false,
  className = ''
}: CardViewProps) => {
  const displacement = disableDisplacement 
    ? { x: 0, y: 0, rotate: 0 } 
    : getCardDisplacement(card.id);
  
  return (
    <motion.div
      className={`card ${className}`}
      
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      initial={
        card.cardStatus === 'entering'
          ? { scale: 0.9, rotate: 0, opacity: 0.2, y: +26 }
          : card.cardStatus === 'attaching' || isFaceCard(card)  
          ? { scale: 1.1, rotate: 0, opacity: 0.2, x: +26 }
          : {
              x: displacement.x,
              y: displacement.y,
              rotate: displacement.rotate,
            }
      }
      animate={
        card.cardStatus === 'destroying'
          ? {
            scale: [1, 1.1, 0.3],
            opacity: [1, 0.8, 0],
            filter: ["brightness(1)", "brightness(2)", "brightness(0)"],
            rotate: [0, 5, 15]
            }
          : { 
              scale: 1, 
              rotate: displacement.rotate, 
              opacity: 1, 
              x: displacement.x,
              y: displacement.y 
            }
      }
      transition={{ 
        duration: card.cardStatus === 'destroying' ? 3 : 0.3, 
        ease: 'easeInOut' 
      }}
      onAnimationComplete={() => {
        if (card.cardStatus === 'destroying') {
          onDestroyAnimationComplete?.();
        }
        // Reset entering status after animation
        if (card.cardStatus === 'entering') {
          card.cardStatus = 'idle';
        }
      }}
    >
      <div className={`card-root`}>
        <img
          src={
            turned === true ? cardBackBlue : cardPaths[`${card.value}_${card.suit}`]
          }
          className="card-face"
          draggable={false}
        />
      </div>
    </motion.div>
  );
};