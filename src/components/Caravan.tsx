import { AnimatePresence, motion } from 'framer-motion';

import './Caravan.css';
import { CardView, getCardDisplacement } from './Card';
import { type Card, type CaravanId } from '../game/types';
import {
  getCaravanDirection,
  getCaravanScore,
  type CaravanStatus,
  type PlayResult,
} from '../game/rules';
import type { HoverTarget } from '../game/actions';

import { CaravanArrowP5 } from './CaravanArrowP5';

type CaravanProps = {
  id: CaravanId;
  cards: Card[];
  playResult: PlayResult | null;
  hoverTarget: HoverTarget | null;
  onHoverTarget: (target: HoverTarget | null) => void;
  onTargetClick: (target: HoverTarget) => void;
  status: CaravanStatus;
  onDestroyAnimationComplete: () => void
};

export const Caravan = ({
  id,
  cards,
  playResult,
  hoverTarget,
  onHoverTarget,
  onTargetClick,
  status,
  onDestroyAnimationComplete
}: CaravanProps) => {
  const caravanTarget: HoverTarget = {
    type: 'caravan',
    owner: id[0] === 'p' ? 'player' : 'enemy',
    caravanId: id,
  };

  const isHovered =
    hoverTarget?.type === 'caravan' &&
    hoverTarget.caravanId === id;

  const isPlayable = isHovered && playResult?.allowed;  

  // Calculate dynamic height based on number of cards
  // Base height for empty caravan (80px) + spacing for each card (36px per card)
  const minHeight = 150; // Minimum clickable area at bottom
  const cardSpacing = 40;
  const dynamicHeight = cards.length > 0 
    ? minHeight + (cards.length * cardSpacing)
    : 190; // Default height when empty

  return (
    <div
      onMouseEnter={() => onHoverTarget(caravanTarget)}
      onMouseLeave={() => onHoverTarget(null)}
      onClick={() => {
        if (isPlayable) onTargetClick(caravanTarget);
      }}
      className={`
        caravan ${status}
        ${caravanTarget.owner === 'enemy' ? 'enemy' : ''}
        ${isHovered && !isPlayable ? 'caravan-blocked' : ''}
        ${isPlayable ? 'caravan-playable' : ''}
      `}
      style={{
        height: `${dynamicHeight}px`
      }}
    >
    <AnimatePresence>
      {cards.map((card, index) => {
        const displacement = getCardDisplacement(card.id);

        const cardTarget: HoverTarget = {
          type: 'placed',
          card,
          owner: caravanTarget.owner,
          caravanId: id,
        };

        const isCardHovered =
          hoverTarget?.type === 'placed' &&
          hoverTarget.card.id === card.id;

        const canAttach = isCardHovered && playResult?.allowed;

        return (
          <motion.div
            key={card.id}
            className="caravan-card"
            style={{
              top: index * 36,
              zIndex: index + 20,
              position: 'absolute',
            }}
            animate={{
              x: displacement.x + (isCardHovered ? 28 : 0),
              y: displacement.y,
              rotate: displacement.rotate,
            }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 40,
            }}
            onMouseEnter={() => onHoverTarget(cardTarget)}
            onMouseLeave={() => onHoverTarget(null)}
            onClick={(e) => {
              e.stopPropagation();
              if (canAttach) onTargetClick(cardTarget);
            }}
          >
            {/* BASE CARD */}
            <CardView
              card={card}
              onClick={() =>
                onTargetClick({
                  type: 'placed',
                  caravanId: id,
                  owner: caravanTarget.owner,
                  card,
                })
              }
              onDestroyAnimationComplete={onDestroyAnimationComplete}
            />

            {/* ATTACHMENTS â€” PURELY VISUAL */}
            
            {card.attachments?.map((attachment, i) => (
              <div
                key={attachment.id}
                className="card-attachment"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 25 + i * 18,
                  zIndex: 40 + i,
                  pointerEvents: 'none',                  
                }}
              >
                <CardView card={attachment} />
              </div>
            )
            )}
          </motion.div>
        );
      })}
      </AnimatePresence>

      <div className={`caravan-score ${caravanTarget.owner === 'enemy' ? 'rotate' : ''} ${status}`}>
        {getCaravanScore(cards)}
      </div>

      <CaravanArrowP5
        direction={getCaravanDirection(cards)}
      />

      {status === 'sold' && (
        <div className={`caravan-sold-label ${status}`}>Vendida</div>
      )}
      {status === 'overburden' && (
        <div className={`caravan-overburden-label ${status}`}>
          Sobrecarregada
        </div>
      )}
      {status === 'contest' && (
        <div className={`caravan-contest-label ${status}`}>
          Contestada
        </div>
      )}
    </div>
  );
};