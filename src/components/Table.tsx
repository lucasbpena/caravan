import './Table.css';

import { Caravan } from './Caravan';
import { PLAYER_CARAVANS, ENEMY_CARAVANS } from '../game/types';
import type { CaravanId, GameState } from '../game/types';
import { gameActions, type CardSelect, type PlayResult } from '../game/actions';

import { Deck } from './Deck';
import { DiscardPile } from './Discard';


type TableProps = {
  game: GameState;
  onCaravanClick: (id: CaravanId) => void;
  onPlacedCardClick: ( targetSel: CardSelect, caravanId: CaravanId) => void;
  getCaravanPlayResult: (id: CaravanId) => PlayResult;
  getAttachPlayResult: ( targetSel: CardSelect ) => PlayResult;
};

export const Table = ({game, onCaravanClick, onPlacedCardClick, getCaravanPlayResult, getAttachPlayResult}: TableProps) => {
  return (
    <div className="table-wrapper">
      <div className="table-grid">
        {ENEMY_CARAVANS.map((id) => (
          <Caravan
            key={id}
            id={id}
            cards={game.caravans[id]}
            onCaravanClick={() => onCaravanClick(id)}
            onPlacedCardClick={onPlacedCardClick}
            playState={{allowed: false, reason: 'Caravana inimiga'}}
            getAttachPlayResult={getAttachPlayResult}
            enemy={true}
          />
        ))}

        {PLAYER_CARAVANS.map((id) => (
          <Caravan
            key={id}
            id={id}
            cards={game.caravans[id]}
            onCaravanClick={() => onCaravanClick(id)}
            onPlacedCardClick={onPlacedCardClick}
            playState={getCaravanPlayResult(id)}
            getAttachPlayResult={getAttachPlayResult}
          />
        ))}
      </div>
        <div className="table-side">
          <Deck
            count={game.player.deck.length}
            onClick={() => gameActions.drawCard(game)}
          />

          <DiscardPile
            top={game.player.discard.at(-1)}
            count={game.player.discard.length}
          />
        </div>
    </div>
  );
};
