import './Caravan.css'
import { CardImageRenderer } from "./Card";
import type { Card, CaravanId, } from "../game/types";
import { getCaravanScore,  } from '../game/actions';
import type { PlayResult, CardSelect } from '../game/actions';


type CaravanProps = {
  id: CaravanId;
  cards: Card[];  
  onCaravanClick: (caravanId: CaravanId) => void;
  onPlacedCardClick: (targetSel: CardSelect, caravanId: CaravanId) => void;
  playState: PlayResult;
  getAttachPlayResult: ( targetSel: CardSelect ) => PlayResult;
  enemy?: boolean;
};

export const Caravan = ({
  id,
  cards,
  onCaravanClick,
  onPlacedCardClick,
  playState,
  getAttachPlayResult,
  enemy
}: CaravanProps) => {

  const isNeutral = playState.allowed === null;
  const isPlayable = playState?.allowed === true;
  
  console.log(isNeutral, playState)
  return (
    <div
      onClick={() => {
        if (playState && !playState.allowed) return;
        onCaravanClick(id);
      }}
      className={`
        caravan
        ${enemy ? 'enemy' : isNeutral ? '' : isPlayable ? 'caravan-playable' : 'caravan-blocked' }        
      `}
    >
      {cards.map((card, index) => (
        <div
          key={card.id}
          onClick={(e) => {
            const attachState = getAttachPlayResult({ card: card, origin: id})
            if (!attachState.allowed) return;
            e.stopPropagation();
            onPlacedCardClick({ card: card, origin: id}, id);
          }}
          className={            
            `caravan-card
            ${getAttachPlayResult(
              { card: card, origin: id}
            ).allowed ? 'card-attachable' : 'card-blocked'}
            `}
          style={{
            top: index * 36,
            zIndex: index + 20
          }}
        >
          <CardImageRenderer card={card} />
        </div>
      ))}

      <div className="caravan-score">{getCaravanScore(cards)}</div>      
    </div>
  );
};
