import { AnimatePresence, motion, type MotionStyle } from 'framer-motion';
import './Hands.css';

import { CardView } from './Card';
import type { Card } from '../game/types';

type HandProps = {
  hand: Card[];
  onCardSelect: (selection: Card | null) => void;
  cardSel: Card | null;
};

export const Hand = ({ hand, onCardSelect, cardSel }: HandProps) => {
  function getCardMotion(
    index: number,
    isActive: boolean,
    total: number
  ): MotionStyle {
    const center = (total - 1) / 2;
    const offset = index - center;
    const depth = total - Math.abs(offset);

    return {
      x: offset * 80,
      y: isActive ? -50 : Math.abs(offset) * 6,
      rotate: offset * 4,
      zIndex: 100 + depth,
    };
  }

  return (
    <div className="hand">
      {hand.map((card, i) => {
        const isActive = card.id === cardSel?.id;

        return (
          <motion.div
            key={card.id}
            style={getCardMotion(i, isActive, hand.length)}
            animate={{
              scale: isActive ? 1.1 : 1,
              filter: isActive
                ? 'drop-shadow(0 10px 14px rgba(18,236,200,0.8))'
                : 'drop-shadow(0 0px 0px rgba(0,0,0,0))',
            }}
            transition={{
              scale: { duration: 0.2 },
              filter: { duration: 0.2 }
            }}
          >
            <CardView card={card} onClick={() => onCardSelect(card)} />
          </motion.div>          
        );
      })}
    </div>
  );
};