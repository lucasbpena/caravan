import { cardPaths, CardShell } from './Card';
import type { Card } from '../game/types';
import type { CardSelect } from '../game/actions';
import './Hands.css';


type HandProps = {
  hand: Card[];
  onCardSelect?: (selection: CardSelect) => void;
  cardSelection: CardSelect;
}

export const Hand = ({ hand, onCardSelect, cardSelection }: HandProps) => {

  function getCardStyle(
    index: number,
    isActive: boolean,
    total: number,
  ) {
    const center = (total - 1) / 2;
    const offset = index - center;
    const depth = total - Math.abs(offset);

    return {
      '--hand-x': `${offset * 80}px`,
      '--hand-y': `${isActive ? -40 : Math.abs(offset) * 6}px`,
      '--hand-rot': `${offset * 4}deg`,
      zIndex: 100 + depth,
      filter: isActive
        ? 'drop-shadow(0 8px 12px rgba(18, 236, 200, 0.8))'
        : 'none',
    } as React.CSSProperties;
  }  
	
	return (
    <div className="hand">
      {hand.map((card, i) => {
          const isActive = card.id === cardSelection?.card.id;

          return (
            <CardShell
              key={card.id}
              card={card}
              onClick={() => {
                onCardSelect?.({ card, origin: 'player-hand' });
              }}
            >
              <div
                className="card"
                style={getCardStyle(i, isActive, hand.length)}
              >
                <img
                  src={cardPaths[`${card.value}_${card.suit}`]}
                  className="w-30"
                />
              </div>
            </CardShell>
          );
        })}

    </div>
	);
}