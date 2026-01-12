import './Table.css';

import { PLAYER_CARAVANS, ENEMY_CARAVANS, type CaravanId } from '../game/types';
import { type GameState } from '../game/turns';
import { type HoverTarget } from '../game/actions';
import { getCaravanScore, getCaravanStatus, type CaravanStatus, type PlayResult } from '../game/rules';

import { Caravan } from './Caravan';
import { Deck } from './Deck';
import { DiscardPile } from './Discard';


type TableProps = {
  game: GameState;
  playResult: PlayResult | null;
  hoverTarget: HoverTarget | null;
  onHoverTarget: (target: HoverTarget | null) => void;
  onTargetClick: (target: HoverTarget) => void;
  onDestroyAnimationComplete: () => void;
};

export const Table = ({ game, playResult, hoverTarget, onHoverTarget, onTargetClick, onDestroyAnimationComplete }: TableProps) => {

  const caravanStatuses: Record<CaravanId, CaravanStatus> = {} as Record<CaravanId, CaravanStatus>;

  for (let i = 1; i <= 3; i++) {
    const playerId = `p-${i}` as CaravanId;
    const enemyId = `e-${i}` as CaravanId;

    caravanStatuses[playerId] = getCaravanStatus(
      getCaravanScore(game.caravans[playerId]), 
      getCaravanScore(game.caravans[enemyId])
    );
    
    caravanStatuses[enemyId] = getCaravanStatus(
      getCaravanScore(game.caravans[enemyId]), 
      getCaravanScore(game.caravans[playerId])
    );
}


  return (
    <div className="table-wrapper">
      <div className="table-grid">
        {ENEMY_CARAVANS.map((id) => (
          <Caravan
          key={id}
          id={id}
          cards={game.caravans[id]}
          playResult={playResult}
          hoverTarget={hoverTarget}
          onHoverTarget={onHoverTarget}
          onTargetClick={onTargetClick}
          status={caravanStatuses[id]}
          onDestroyAnimationComplete={onDestroyAnimationComplete}
        />

        ))}

        

        {PLAYER_CARAVANS.map((id) => (
          <Caravan
            key={id}
            id={id}
            cards={game.caravans[id]}
            playResult={playResult}
            hoverTarget={hoverTarget}
            onHoverTarget={onHoverTarget}
            onTargetClick={onTargetClick}
            status={caravanStatuses[id]}
            onDestroyAnimationComplete={onDestroyAnimationComplete}
          />
        ))}
      </div>
        <div className="table-side">
          <Deck
            count={game.player.deck.length}
            onTargetClick={onTargetClick}
          />
          {/*
          <DiscardPile
            top={game.player.discardPile.at(-1)}
            count={game.player.discardPile.length} 
          />*/}
        </div>
    </div>
  );
};
