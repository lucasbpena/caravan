import './Deck.css';

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
      <div className="deck-card" />
      <span className="deck-count">{count}</span>
    </div>
  );
};
