import type { Card } from '../game/types';
import './Card.css';

// Import card images
const cardModules = import.meta.glob('../assets/vector-cards/*', { eager: true, as: 'url' });

export const cardPaths: Record<string, string> = Object.fromEntries(
    Object.entries(cardModules).map(([path, module]) => {
    const filename = path
			.split('/')
			.pop()!
			.replace(/\.\w+$/, '');

    return [filename, module];
  })
);

export const CardImageRenderer = ({ card }: { card: Card }) => {
  return (
    <div className="card-root">
      <img src={cardPaths[`${card.value}_${card.suit}`]} className="card-face" />

      {card.attachments && card.attachments.length > 0 && (
        <div className="card-attachments">
          {card.attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className="card-attachment"
              style={{
                top: index * 6,
                right: index * -12
              }}
            >
              <img
                src={cardPaths[`${attachment.value}_${attachment.suit}`]}
                className="attachment-face"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


type CardShellProps = {
  card: Card;
  selected?: boolean;
  disabled?:boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const CardShell = ({
  card,
  selected,
  disabled,
  onClick,
  children,
}: CardShellProps) => {
  return (
    <div
      className={`
        card-shell
        ${selected ? 'card-selected' : ''}
        ${disabled ? 'card-disabled' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick?.();
      }}
    >
      {children}
    </div>
  );
};