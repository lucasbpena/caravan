import './App.css'
import floorBg from './assets/table2.jpg';
import { useState, useReducer, useEffect } from 'react';

import { type Card, createDeck } from './game/types';
import { type PlayResult, gameRules } from './game/rules';
import { type HoverTarget, gameActions } from './game/actions';
import { type GameState, gameReducer, isGameOver } from './game/turns';

import { decideAiAction } from './ai/aiController';

import { Table } from './components/Table'
import { Hand } from './components/Hand'
import { GameEndBanner } from './components/GameEndBanner';

function App() {
	
	// React states
	const [cardSel, setCardSel] = useState<Card | null>(null);
	const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null)	

	// Setup reducer
	const initGame: GameState = {
		turn: { currentPlayer: 'player', phase: 'setup', turnNumber: 1 },
		player: { deck: [], hand: [], discardPile: [] },
		enemy: { deck: [], hand: [], discardPile: [] },
		caravans: {
			'p-1': [], 'p-2': [], 'p-3': [],
			'e-1': [], 'e-2': [], 'e-3': [],
		},		
	};

	const [game, dispatch] = useReducer(
		gameReducer,
		initGame,
		(baseGame): GameState => {
			let game = {
				...baseGame,
				player: {
					...baseGame.player,
					deck: createDeck(),
				},
				enemy: {
					...baseGame.enemy,
					deck: createDeck(),
				},
			};

			game = gameActions.drawHand(game, 'player');
			game = gameActions.drawHand(game, 'enemy');

			return game;
		}
	);
	
	const isOver = isGameOver(game)

	const onRestart = () => {
		dispatch({ type: 'RESTART_GAME' });
	}

	// Process AI turn
	useEffect(() => {
		if (game.turn.currentPlayer !== "enemy") return;

		const action = decideAiAction(game, "enemy");

		const timeout = setTimeout(() => {
			dispatch(action);
		}, 300);

		return () => clearTimeout(timeout);
	}, [game.turn, game]);


	// Playability check
	const getPlayability = (target: HoverTarget | null): PlayResult | null => {
		// If no selection
		if (!cardSel) return null;

		if (game.turn.currentPlayer !== 'player') {			
			return null
		}

		switch (target?.type) {
			case 'caravan':
				// if not player caravans
				if (target.caravanId[0] !== 'p') {
					return null
				}

				if (game.turn.phase === 'setup') {
					return gameRules.canPlayCaravanSetup(
						cardSel,
					game.caravans[target.caravanId]
				)

				} else {
					return gameRules.canPlayToCaravan(
						cardSel,
						game.caravans[target.caravanId]
					);

				}
				
			case 'placed':
				return gameRules.canAttachCard(cardSel, target.card);

			default:
				return null;
		}
	};
	
	// Click handler
	const handlePlay = (target: HoverTarget) => {
		if (!cardSel) return;

		switch (target.type) {

			case 'deck': {
				dispatch({
					type: 'DISCARD_DRAW',
					cardSel: cardSel,
					playerId: 'player'
				})
				break
			}	

			case 'caravan': {
				const result = gameRules.canPlayToCaravan(
					cardSel,
					game.caravans[target.caravanId]
				);

				if (!result?.allowed) return;

				dispatch({
					type: 'PLAY_CARD_TO_CARAVAN',
					cardSel,
					caravanId: target.caravanId,
					playerId: 'player',
				});

				break;
			}

			case 'placed': {
				const result = gameRules.canAttachCard(cardSel, target.card);

				if (!result?.allowed) return;

				dispatch({
					type: 'ATTACH_CARD',
					cardSel,
					targetSel: target.card,
					caravanId: target.caravanId,
					playerId: 'player',
				});

				break;
			}

			default:
				return;
		}
		
		// cleanup after successful play
		setCardSel(null);
		setHoverTarget(null);
	};

	const handleDestroyAnimationComplete = () => {
		dispatch({ type: 'REMOVE_DESTROYED_CARDS' });
	};

	// Main App render
	//style={{backgroundImage: `url(${floorBg})`}}
	return (
		<div 
			className="
				relative
				w-full
				min-h-screen
				bg-linear-to-br from-sky-50 via-sky-100 to-sky-200
				flex
				flex-col
				items-center
				overflow-x-hidden
				isolate
			"
		>
			{isOver && (
				<GameEndBanner
					result={isOver}
					onRestart={onRestart}
				/>
			)}

			{/* Game */}	
			<h1 className='title-text pl-20'>OCaravana</h1>
			<div className="game">															
				<div>
						<Hand hand={game.enemy.hand} onCardSelect={setCardSel} cardSel={cardSel} turned={true}/>
						<Table 
							game={game} 
							playResult={getPlayability(hoverTarget)}
							hoverTarget={hoverTarget}
							onHoverTarget={setHoverTarget}
							onTargetClick={handlePlay}
							onDestroyAnimationComplete={handleDestroyAnimationComplete}
						/>
						<Hand hand={game.player.hand} onCardSelect={setCardSel} cardSel={cardSel}/>
					</div>
				</div>
			</div>
	)
};

export default App