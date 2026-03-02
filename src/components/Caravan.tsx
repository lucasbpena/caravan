import { AnimatePresence, motion } from 'framer-motion';

import { Trash2 } from 'lucide-react';

import { useRef, useEffect } from 'react';

import './Caravan.css';
import { CardView } from './Card';
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
import heartsIcon from '../assets/hearts.png';
import diamondsIcon from '../assets/diamonds.png';
import clubsIcon from '../assets/clubs.png';
import spadesIcon from '../assets/spades.png';
import type { SoundName } from '../game/useSound';

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
  playSound?: (soundName: SoundName, volume?: number) => void;

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
  onDiscardCaravan,
  playSound
}: CaravanProps) => {

   // Ref para guardar o status anterior
  const previousStatus = useRef<CaravanStatus>(status);

  // useEffect para detectar mudanças de status
  useEffect(() => {
    // Verifica se o status mudou
    if (previousStatus.current !== status) {
      // Tocar som baseado no novo status
      if (playSound) {
        switch (status) {
          case 'sold':
            playSound('caravan-sold', 0.7);
            break;
          case 'overburden':
            playSound('caravan-overburden', 0.6);
            break;
          case 'contest':
            playSound('caravan-contest', 0.5);
            break;
          // Não tocar som para 'empty' ou 'under'
        }
      }

      // Atualiza o status anterior
      previousStatus.current = status;
    }
  }, [status, playSound]);
  
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
  const minHeight = 130; // Minimum clickable area at bottom
  const cardSpacing = 20;
  const dynamicHeight = cards.length > 0 
    ? minHeight + (cards.length * cardSpacing)
    : 100; // Default height when empty

  const activeQueenSuit = getActiveQueenSuit(cards);

  return (
    <div
      onMouseEnter={() => onHoverTarget(caravanTarget)}
      onMouseLeave={() => onHoverTarget(null)}
      onClick={() => {
        if (isPlayable) onTargetClick(caravanTarget);
      }}
      className={
        cards.length === 0 ? `caravan ${caravanTarget.owner === 'enemy' ? 'enemy' : 'empty'} ${isHovered && !isPlayable ? 'caravan-blocked' : ''} ${isPlayable ? 'caravan-playable' : ''}` :
        `       
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
          className='relative right-8 top-8 w-5 overflow-visible
                    cursor-pointer
                    text-red-800
                    bg-amber-50 hover:bg-red-400
                    p-1 rounded-full
                    '
          onClick={() => onDiscardCaravan? onDiscardCaravan(id) : ''}/>            
      )}
      
    <AnimatePresence>
      {cards.map((card, index) => {

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
              zIndex: index + 20,
              position: 'absolute',
            }}
            initial={{
              top: index * 20,
            }}
            animate={{
              top: index * 20,
              x: canAttach ? 12 : 0,
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
              className={isCardHovered ? canAttach ?'playable' : 'blocked' : ''}
            />

            {/* ATTACHMENTS */}
            
            {card.attachments?.map((attachment, i) => (
              <div
                key={attachment.id}
                className="card-attachment"
                style={{
                  position: 'absolute',
                  top: 10,
                  left: 26 + i * 12,
                  zIndex: 40 + i,
                  pointerEvents: 'none',                  
                }}
              >
                <CardView 
                  card={attachment} 
                  onDestroyAnimationComplete={onDestroyAnimationComplete}
                />
              </div>
            )
            )}
          </motion.div>
        );
      })}
      </AnimatePresence>

      <div className={`caravan score ${caravanTarget.owner === 'enemy' ? 'rotate' : ''} ${status}`}>
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
        <div className={`caravan sold label ${status} ${caravanTarget.owner === 'enemy' ? 'rotate' : ''}`}>Vendida</div>
      )}
      {status === 'overburden' && (
        <div className={`caravan overburden label ${status} ${caravanTarget.owner === 'enemy' ? 'rotate' : ''}`}>
          Sobrecarregada
        </div>
      )}
      {status === 'contest' && (
        <div className={`caravan contest label ${status} ${caravanTarget.owner === 'enemy' ? 'rotate' : ''}`}>
          Contestada
        </div>
      )}
    </div>
  );
};