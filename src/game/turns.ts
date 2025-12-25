import { type Card, type CaravanId, type Player, createDeck } from "./types";


import { useState } from "react";

import { gameActions, type CardSelect } from "./actions";

export type PlayerId = 'player' | 'enemy';

export type GamePhase =
  | 'setup'
  | 'main';


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

export function useGameState() {
	const [game, setGame] = useState<GameState>({
		turn: {currentPlayer: 'player', phase: "setup", turnNumber: 1},
		player: {deck: createDeck(), hand: [], discardPile: []},
		enemy: {deck: createDeck(), hand: [], discardPile: []},
		caravans: {
			"p-1": [],
			"p-2": [],
			"p-3": [],
			"e-1": [],
			"e-2": [],
			"e-3": [],
		},
	});

	return { game, setGame };
}

export type GameAction =
  | { type: 'PLAY_VALUE' }
  | { type: 'PLAY_FIGURE'; cardSel: string; target: CaravanId }
  | { type: 'DISCARD_DRAW'; cardSel: CardSelect }
  | { type: 'DISCARD_CARAVAN'; target: CaravanId };


const allowedActions: Record<GamePhase, GameAction['type'][]> = {
  setup: ['PLAY_VALUE'],
  main: ['PLAY_VALUE', 'PLAY_FIGURE', 'DISCARD_DRAW', 'DISCARD_CARAVAN'],
};


export function gameReducer(
  game: GameState,
  action: GameAction,
	cardSel: CardSelect,
	targetSel: CardSelect | CaravanId
): GameState {
  const { phase } = game.turn;

  if (!allowedActions[phase].includes(action.type)) {
    return game; // illegal action
  }

  switch (action.type) {
    case 'DISCARD_DRAW': {
			const playerAfterDiscard = gameActions.discardCard(game.player, cardSel);
			const playerAfterDraw = gameActions.drawCard(playerAfterDiscard);

			return {
				...game,
				player: playerAfterDraw,
			};
		}		
		case 'PLAY_VALUE': {
			gameActions.playCardToCaravan(game, cardSel, targetSel as CaravanId)
			return game
		}
		case 'PLAY_FIGURE': {
			return game
		}
		case 'DISCARD_CARAVAN': {
			return game
		}
    default:
      return game;
  }
}

const phaseOrder: GamePhase[] = ['setup', 'main'];

function advancePhase(state: GameState): GameState {
  const index = phaseOrder.indexOf(state.turn.phase);
  const nextPhase = phaseOrder[index + 1];

  if (!nextPhase) return state;

  return {
    ...state,
    turn: {
      ...state.turn,
      phase: nextPhase,
    },
  };
}

function nextTurn(state: GameState): GameState {
  const nextPlayer =
    state.turn.currentPlayer === 'player' ? 'enemy' : 'player';

  return {
    ...state,
    turn: {
      currentPlayer: nextPlayer,
      phase: 'setup',
      turnNumber: state.turn.turnNumber + 1,
    },
  };
}

