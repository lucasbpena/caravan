import './App.css'
import floorBg from './assets/table2.jpg';

import { useState } from 'react';

import { useGameState } from './game/types'

import { Table } from './components/Table'
import { Hand } from './components/Hand'

import type { CaravanId } from './game/types';
import { canAttachCard, gameActions } from './game/actions';

import { canPlayToCaravan } from './game/actions';

import type { CardSelect, PlayResult } from './game/actions';

function App() {
	
	const { game, setGame } = useGameState();
	const [cardSel, setCardSel] = useState<CardSelect>(null);
	//const [targetSel, setTargetSel] = useState<CardSelect>(null);

	// Play rules state helpers
	const getCaravanPlayState = (caravanId: CaravanId): PlayResult => {
		return canPlayToCaravan(game, cardSel, caravanId);
	};

	const getAttachPlayState = ( targetSel: CardSelect ): PlayResult => {
		return canAttachCard(cardSel, targetSel);		
	};
	
	// Click handlers
	const handleCaravanClick = (caravanId: CaravanId): PlayResult | void => {
		if (!cardSel) return;

			const caravanPlayResult = canPlayToCaravan(game, cardSel, caravanId)
		
			if (caravanPlayResult?.allowed) {
				setGame(prev =>
					gameActions.playCardToCaravan(prev, cardSel, caravanId)
				);
				setCardSel(null);				
			}
		};
	
	const handlePlacedCardClick = ( targetSel: CardSelect, caravanId: CaravanId) => {					
		if (!cardSel || !targetSel) return;

		//if targetSel.origin === 'hand'
		//setTargetSel(targetSel)

		const attachPlayResult = canAttachCard(cardSel, targetSel);
		
		if (attachPlayResult?.allowed) {
			setGame(prev =>
				gameActions.attachCardToCard(prev, cardSel, targetSel, caravanId)
			);
			setCardSel(null);
			//setTargetSel(null);
		}

		
	};
	
	// Main App render
	return (
		<div 
			className="
				relative
				w-screen
				min-h-screen
				bg-size[auto_10%]
				bg-center
				flex
				flex-col
				overflow-hidden
				isolate
			"
			style={{backgroundImage: `url(${floorBg})`}}
			onClick={() => setCardSel(null)}
		>

			{/* Dark overlay */}
			<div className="absolute inset-0 z-10 bg-black/18 pointer-events-none" />

			{/* Lamp light */}
			<div
				className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"

				style={{
					background: `
						radial-gradient(
							ellipse at 50% 40%,
							rgba(255, 220, 150, 0.55) 0%,
							rgba(255, 200, 120, 0.35) 25%,
							rgba(255, 180, 90, 0.18) 45%,
							rgba(0, 0, 0, 0.55) 70%,
							rgba(0, 0, 0, 0.85) 90%
						)
					`,
				}}
			/>

			{/* Game */}	
			<h1 className='title-text pl-20 mix-blend-soft-'>OCaravana</h1>
			<div className="game">															
				<div>
						<Hand hand={game.enemy.hand} onCardSelect={setCardSel} cardSelection={cardSel} />
						<Table 
							game={game} 
							onCaravanClick={handleCaravanClick} 
							onPlacedCardClick={handlePlacedCardClick}
							getCaravanPlayResult={getCaravanPlayState}
							getAttachPlayResult={getAttachPlayState}
						/>
						<Hand hand={game.player.hand} onCardSelect={setCardSel} cardSelection={cardSel}/>
					</div>
				</div>
			</div>
	)
};

export default App
