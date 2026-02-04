import { type Card, type CaravanId, type Player, createDeck} from "./types";
import { gameActions  } from "./actions";
import { getCaravanScore, getCaravanStatus } from "./rules";


export type PlayerId = 'player' | 'enemy';

export type GamePhase =
  | 'setup'
  | 'main'
  | 'over';


export type TurnState = {
  currentPlayer: PlayerId;
  phase: GamePhase;
  turnNumber: number;
};

export type SelectionMode = 'none' | 'value-card' | 'face-card';

export interface GameState {
	turn: TurnState
  player: Player;
  enemy: Player;
  caravans: Record<CaravanId, Card[]>;
};

export type GameAction =
  | { type: 'PLAY_CARD_TO_CARAVAN'; cardSel: Card; caravanId: CaravanId; playerId: PlayerId}
  | { type: 'ATTACH_CARD'; cardSel: Card; targetSel: Card; caravanId: CaravanId; playerId: PlayerId}
  | { type: 'DISCARD_DRAW'; cardSel: Card; playerId: PlayerId }
  | { type: 'DISCARD_CARAVAN'; caravanId: CaravanId }
  | { type: 'REMOVE_DESTROYED_CARDS'}
  | { type: 'RESTART_GAME'};


const allowedActions: Record<GamePhase, GameAction['type'][]> = {
  setup: ['PLAY_CARD_TO_CARAVAN'],
  main: ['PLAY_CARD_TO_CARAVAN', 'ATTACH_CARD', 'DISCARD_DRAW', 'DISCARD_CARAVAN'],
  over: ['RESTART_GAME'],
};


function advanceTurn(game: GameState): GameState {
  const nextPlayer = game.turn.currentPlayer === 'player' ? 'enemy' : 'player';

  if (game.turn.phase === 'setup') {
    if (Object.values(game.caravans).every(caravan => caravan.length > 0)) {
      return {
        ...game,
        turn: {
          currentPlayer: nextPlayer,
          phase: 'main',
          turnNumber: game.turn.turnNumber + 1,
        },
      };
    } else {
      return {
        ...game,
        turn: {
          currentPlayer: nextPlayer,
          phase: game.turn.phase,
          turnNumber: game.turn.turnNumber + 1,
        },
      };
    }
  } else if (isGameOver(game))  {
    return {
      ...game,
      turn: {
        currentPlayer: nextPlayer,
        phase: 'over',
        turnNumber: game.turn.turnNumber + 1,
      },
    };

  } else {
    return {
      ...game,
      turn: {
        currentPlayer: nextPlayer,
        phase: game.turn.phase,
        turnNumber: game.turn.turnNumber + 1,
      },
    };
  }
}

export const isGameOver = (game: GameState): PlayerId | false => {
  let playerSold = 0;
  let enemySold = 0;

  for (let i = 1; i <= 3; i++) {
    const playerId = `p-${i}` as CaravanId;
    const enemyId = `e-${i}` as CaravanId;

    const playerScore = getCaravanScore(game.caravans[playerId]);
    const enemyScore = getCaravanScore(game.caravans[enemyId]);

    const playerStatus = getCaravanStatus(playerScore, enemyScore);
    const enemyStatus = getCaravanStatus(enemyScore, playerScore);

    if (playerStatus === 'sold') playerSold++;
    if (enemyStatus === 'sold') enemySold++;
  }

  if (playerSold >= 2) {
    return 'player'
  } else if (enemySold >= 2) { 
    return 'enemy'
  }

  return false
};


// Game Reducer
export function gameReducer(
  game: GameState,
  action: GameAction | null,
): GameState {

  const phase = game.turn.phase;

  if (action) {
    if (Object.hasOwn(allowedActions[phase], action.type)) return game

    switch (action.type) {

      case 'PLAY_CARD_TO_CARAVAN': {
        const gameChange = gameActions.playCardToCaravan(
            game,
            action.cardSel.id,
            action.caravanId,
            action.playerId
          );
        if (phase === 'setup') {
          
          const caravans = [
            gameChange.caravans[`${action.playerId[0]}-1` as CaravanId],
            gameChange.caravans[`${action.playerId[0]}-2` as CaravanId],
            gameChange.caravans[`${action.playerId[0]}-3` as CaravanId],
          ]

          if (caravans[0].length > 0 && caravans[1].length > 0 && caravans[2].length > 0 ) {
            return advanceTurn(gameChange)

          } else {
            return gameChange
          }           
        } else {
          return advanceTurn(gameChange);
        }
      }      
      
    case 'ATTACH_CARD': {
      if (phase !== 'main') return game;

      const gameChange = gameActions.attachCardToCard(
        game,
        action.cardSel.id,
        action.targetSel.id,
        action.playerId
      );

      return advanceTurn(gameChange)
    }

    case 'DISCARD_DRAW': {
      //if (phase !== 'main') return game;

      const gameChange = gameActions.discardAndDraw(game, action.playerId, action.cardSel.id);      

      return advanceTurn(gameChange);
    }

    case 'REMOVE_DESTROYED_CARDS': {
      return {
        ...game,
        caravans: Object.fromEntries(
          Object.entries(game.caravans).map(([id, cards]) => [
            id,
            cards.filter(card => card.cardStatus !== 'destroying')
          ])
        ) as Record<CaravanId, Card[]>
      };
    }

    case 'RESTART_GAME': {
      let newGame: GameState = {
        turn: { currentPlayer: 'player', phase: 'setup', turnNumber: 1 },
        player: { deck: createDeck(), hand: [], discardPile: [] },
        enemy: { deck: createDeck(), hand: [], discardPile: [] },
        caravans: {
          'p-1': [], 'p-2': [], 'p-3': [],
          'e-1': [], 'e-2': [], 'e-3': [],
        },
      };

      // Draw hands for both players
      newGame = gameActions.drawHand(newGame, 'player');
      newGame = gameActions.drawHand(newGame, 'enemy');

      return newGame;
    }

    default:
      return game;
    }
  } else {
    return game
  }
}