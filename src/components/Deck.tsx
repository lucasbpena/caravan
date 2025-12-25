import './Deck.css';

type DeckProps = {
  count: number;
  onClick: () => void;
};

export const Deck = ({ count, onClick }: DeckProps) => {
  return (
    <div className="deck" onClick={onClick}>
      <div className="deck-card" />
      <span className="deck-count">{count}</span>
    </div>
  );
};
