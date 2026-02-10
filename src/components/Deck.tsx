import './Deck.css';

import cardBackRed from '../assets/1800-cards/back-red.png';

import { type HoverTarget } from '../game/actions';
type DeckProps = {
  count: number;
  onTargetClick: (target: HoverTarget) => void;
};

export const Deck = ({ count, onTargetClick }: DeckProps) => {
  const deckTarget: HoverTarget = {type: 'deck'}
  return (
    <div className="deck" onClick={() => onTargetClick(deckTarget)}>
      <img
        src={cardBackRed}
        //className="card-face"
        draggable={false}
        className='deck-card'
      />
      <span className="deck-count">{count}</span>
    </div>
  );
};
