import './App.css'
import { useState, useReducer, useEffect, useRef, useCallback } from 'react';

import { type CaravanId, type Card, createDeck } from './game/types';
import { type PlayResult, gameRules } from './game/rules';
import { type HoverTarget, gameActions } from './game/actions';
import { type GameState, gameReducer, isGameOver } from './game/turns';
import { useSound, type SoundName } from './game/useSound';

import { decideAiAction } from './ai/aiController';

import { Table } from './components/Table'
import { Hand } from './components/Hand'
import { GameEndBanner } from './components/GameEndBanner';
import { RulesOverlay } from './components/RulesOverlay';
import { PlayFeedback } from './components/PlayFeedback';

import videoBackground from './assets/background.webm';

function App() {
	
	// Tooltip states
	const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)	

	// Sounds hook
	const { playSound, preloadAllSounds } = useSound();
	
	// Video hook
	const [videoLoaded, setVideoLoaded] = useState(false);

	// React states	
	const [cardSel, setCardSel] = useState<Card | null>(null);
	const [hoverTarget, setHoverTarget] = useState<HoverTarget | null>(null)	

	// Setup game object
	const initGame: GameState = {
		turn: { currentPlayer: 'player', phase: 'setup', turnNumber: 1 },
		player: { deck: [], hand: [], discardPile: [] },
		enemy: { deck: [], hand: [], discardPile: [] },
		caravans: {
			'p-1': [], 'p-2': [], 'p-3': [],
			'e-1': [], 'e-2': [], 'e-3': [],
		},		
	};
	
	// Setup game reducer
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
	
	// Check if Game over
	const isOver = isGameOver(game)
	
	// AI Sound Dict
	const aiSoundDict: Record<string, string> = {
		'PLAY_CARD_TO_CARAVAN': 'card-play',
		'ATTACH_CARD': 'card-attach',
		'DISCARD_DRAW': 'card-play',
	}

	// Preload sounds
	useEffect(() => {
		preloadAllSounds();
	}, [preloadAllSounds]);	

	// Track cursor position
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			setCursorPos({ x: e.clientX, y: e.clientY });
		};

		window.addEventListener('mousemove', handleMouseMove);
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, []);

	// Show feedback only when hover target changes
	useEffect(() => {
		// Clear feedback when no hover or no card selected
		if (!hoverTarget || !cardSel) {
			return;
		}

		// Check playability only when target changes
		const result = getPlayability(hoverTarget);
		
		// Show feedback only if blocked
		if (result && !result.allowed && result.reason) {
			setFeedbackMessage(result.reason);
		}
	}, [hoverTarget]); // Only depend on hoverTarget changes

	// Process AI turn
	useEffect(() => {
		if (game.turn.currentPlayer !== "enemy") return;

		const action = decideAiAction(game, "enemy");

		const timeout = setTimeout(() => {
			dispatch(action);
		}, 300);

		// Play AI sound
		try {
			if (!action?.type) return;

			const sound = aiSoundDict[action.type as keyof typeof aiSoundDict];

			if (!sound) return;

			playSound(sound as SoundName);

		} catch (err) {
			console.warn('Erro ao processar som da ação:', err);
		}

		return () => clearTimeout(timeout);
	}, [game.turn, game]);

	// Playability check - NO STATE UPDATES HERE
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
					);
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

	// Show feedback when hovering over blocked targets
	useEffect(() => {
		if (!hoverTarget || !cardSel) {
			setFeedbackMessage(null);
			return;
		}

		const result = getPlayability(hoverTarget);
		
		if (result && !result.allowed && result.reason) {
			setFeedbackMessage(result.reason);
		} else {
			setFeedbackMessage(null);
		}
	}, [hoverTarget, cardSel, game.caravans, game.turn.phase]);
	
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
				break;
			}	

			case 'caravan': {
				const result = gameRules.canPlayToCaravan(
					cardSel,
					game.caravans[target.caravanId]
				);

				if (!result?.allowed) return;

				playSound('card-play');

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

				playSound('card-attach');

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
		
		setCardSel(null);
		setHoverTarget(null);
	};

	// Restart handler
	const onRestart = () => {
		dispatch({ type: 'RESTART_GAME' });
	}

	// Caravan discard handler
	const handleCaravanDiscard = (caravanId: CaravanId) => {
		dispatch({ type: 'DISCARD_CARAVAN', caravanId: caravanId });
	}	


	// Card removal animation Handler with debouncing
	const destroyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const handleDestroyAnimationComplete = useCallback(() => {
		if (destroyTimeoutRef.current) {
			clearTimeout(destroyTimeoutRef.current);
		}
		
		destroyTimeoutRef.current = setTimeout(() => {
			console.log('🗑️ Dispatching REMOVE_DESTROYED_CARDS');
			dispatch({ type: 'REMOVE_DESTROYED_CARDS' });
			destroyTimeoutRef.current = null;
		}, 2500);
	}, []);	

	// Main App render
	return (		
		<div className="game">
			{/* Video Background */}
			<video
				autoPlay
				loop
				muted
				playsInline
				onLoadedData={() => setVideoLoaded(true)}
				className={`
					transition-opacity duration-1000
					${videoLoaded ? 'opacity-100' : 'opacity-0'}
				`}
			>
				<source src={videoBackground} type="video/webm" />
				<source src={videoBackground.replace('.webm', '.mp4')} type="video/mp4" />
			</video>
			
			{/* Title */}
			<h1 className='title-text'>
				Caravana
			</h1>							
			
			{/* Rules Overlay */}
			<RulesOverlay />

			{/* Game End Banner */}
			{isOver && (				
				<GameEndBanner
					result={isOver}
					onRestart={onRestart}
					playSound={playSound}
				/>
			)}

			{/* Play Feedback Bubble */}
			<PlayFeedback
				message={feedbackMessage}
				cursorPosition={cursorPos}
				type="error"
			/>

			{/* Game */}
			<div className="game-content">
				{/* Enemy Hand */}
				<div className="enemy-hand">
					<Hand 
						hand={game.enemy.hand} 
						onCardSelect={setCardSel} 
						cardSel={cardSel} 
						turned={true}
					/>
				</div>

				{/* Table Area */}
				<div className="table-area">
					<Table 
						game={game} 
						playResult={getPlayability(hoverTarget)}
						hoverTarget={hoverTarget}
						onHoverTarget={setHoverTarget}
						onTargetClick={handlePlay}
						onDestroyAnimationComplete={handleDestroyAnimationComplete}
						onDiscardCaravan={handleCaravanDiscard}
						playSound={playSound}
					/>
				</div>

				{/* Player Hand */}
				<div className="player-hand">
					<Hand 
						hand={game.player.hand} 
						onCardSelect={setCardSel} 
						cardSel={cardSel}
					/>
				</div>
			</div>
		</div>
	)
};

export default App