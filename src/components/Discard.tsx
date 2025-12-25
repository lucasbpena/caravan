import './Discard.css';
import { cardPaths } from './Card';
import type { Card } from '../game/types';

type DiscardPileProps = {
  top?: Card;
  count: number;
};

export const DiscardPile = ({ top, count }: DiscardPileProps) => {
  return (
    <div className="discard">
      {top ? (
        <img
          src={cardPaths[`${top.value}_${top.suit}`]}
          className="discard-top"
        />
      ) : (
        <div className="discard-empty" />
      )}
      <span className="discard-count">{count}</span>
    </div>
  );
};
