import { AnimatePresence, motion } from 'framer-motion';

import { Trash2 } from 'lucide-react';

import './Caravan.css';
import { CardView, getCardDisplacement } from './Card';
import { type Card, type CaravanId, type Suit } from '../game/types';
import {
  getCaravanDirection,
  getCaravanScore,
  type CaravanStatus,
  type PlayResult,
} from '../game/rules';

import type { HoverTarget } from '../game/actions';

import { CaravanArrowP5 } from './CaravanArrowP5';

// Import suit icons
import heartsIcon from '../assets/hearts.jpg';
import diamondsIcon from '../assets/diamonds.jpg';
import clubsIcon from '../assets/clubs.jpg';
import spadesIcon from '../assets/spades.jpg';

const suitIcons: Record<Suit, string> = {
  hearts: heartsIcon,
  diamonds: diamondsIcon,
  clubs: clubsIcon,
  spades: spadesIcon,
};

// Helper function to find active Queen's suit in caravan
function getActiveQueenSuit(cards: Card[]): Suit | null {
  for (const card of cards) {
    if (card.attachments) {
      for (const attachment of card.attachments) {
        if (attachment.value === 'Q' && attachment.cardStatus === 'active') {
          return attachment.suit as Suit;
        }
      }
    }
  }
  return null;
}

type CaravanProps = {
  id: CaravanId;
  cards: Card[];
  playResult: PlayResult | null;
  hoverTarget: HoverTarget | null;
  onHoverTarget: (target: HoverTarget | null) => void;
  onTargetClick: (target: HoverTarget) => void;
  status: CaravanStatus;
  onDestroyAnimationComplete: () => void
  onDiscardCaravan?: (caravanId: CaravanId) => void;
};

export const Caravan = ({
  id,
  cards,
  playResult,
  hoverTarget,
  onHoverTarget,
  onTargetClick,
  status,
  onDestroyAnimationComplete,
  onDiscardCaravan
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

  const activeQueenSuit = getActiveQueenSuit(cards);

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
      {caravanTarget.owner === 'player' && (
        <Trash2 
          className='relative right-8 w-6 overflow-visible
                    cursor-pointer
                    bg-amber-50 hover:bg-red-400
                    p-1 rounded-full
                    '
          onClick={() => onDiscardCaravan? onDiscardCaravan(id) : ''}/>            
      )}
      
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
      {/* Active Queen Suit Icon */}
        {activeQueenSuit && (
          <div className="caravan-queen-icon">
            <img 
              src={suitIcons[activeQueenSuit]} 
              alt={activeQueenSuit}
              className="queen-suit-icon"
            />
          </div>
        )}

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