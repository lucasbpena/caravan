import './Deck.css';

import cardBack from '../assets/card-back1.png'

import { type HoverTarget } from '../game/actions';
type DeckProps = {
  count: number;
  onTargetClick: (target: HoverTarget) => void;
};

export const Deck = ({ count, onTargetClick }: DeckProps) => {
  const deckTarget: HoverTarget = {type: 'deck'
  }
  return (
    <div className="deck" onClick={() => onTargetClick(deckTarget)}>
      <img
        src={cardBack}
        //className="card-face"
        draggable={false}
      />
      <span className="deck-count">{count}</span>
    </div>
  );
};
