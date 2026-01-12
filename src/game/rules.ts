import { type GameState, type GameAction, type PlayerId } from "./turns";
import { type CaravanId, type Card, isFaceCard  } from "./types";

// Caravan properties
export type CaravanStatus = 'empty' | 'under' | 'sold' | 'contest' | 'overburden'

export function getCaravanScore(cards: Card[]) {
  let score = 0;
  for (const card of cards) {
		let kingMultipliers = 0

		// Check for King effects
		if (card.attachments)
		for (const attachment of card.attachments) {
			if (attachment.value === 'K') {
				kingMultipliers += 1
			}
	
		}
		// Return score
		// Calculate king effects on card if any
		if (kingMultipliers > 0) {
			let  cumulative = card.value as number
			for (let i= 0; i < kingMultipliers; i++){
				cumulative *= 2
			}
			score += cumulative
		
			// Add to score without effects
		} else {
	    score += card.value as number;  
		}
  }
  return score;
}

export function getCaravanStatus(score: number, opposingScore: number): CaravanStatus {

	// Get oposing caravan
	if (score === 0) {
		return 'empty'
	} else if (score < 21) {
		return 'under'
	} else if (score > 26) {
		return 'overburden'
	} else {
		if (opposingScore >= 21 && opposingScore <= 26) {
			return 'contest'
		} else {
			return 'sold'
		}		
	}
}


export const getCaravanDirection = (cards: Card[]): boolean | null => {
	// true ascending, false descending, null undefined
	let queenNumber = 0
	
	// Check for Queen effects
	for (const card of cards) {
		if (card.attachments)
		for (const attachment of card.attachments) {
			if (attachment.value == 'Q') {
				queenNumber += 1
			}
		}
	}
	// Get diurection with queen effects
	if (cards.length < 2) {
		return null
	}	
	else if (cards[0].value > cards[1].value) {
		return queenNumber % 2 === 0 ? false : true
	} else {
		return queenNumber % 2 === 0 ? true : false
	}
}

export const getCaravanSuit= (cards: Card[]): string | null => {
    if (cards.length === 0) return null;
    return cards[cards.length - 1].suit;
}


// Find all legal actions
export function getLegalActions(
  game: GameState,
  playerId: PlayerId
): GameAction[] {
  
	const allowedActions: GameAction[] = [];

	switch (game.turn.phase) {
		case 'setup': {			
			
			// Check for all playable cards for each caravan
			for (const card of game[playerId].hand) {
				for (const caravanId in game.caravans) {

					if (caravanId[0] as string === playerId[0] as string) {
		
						const playResult = gameRules.canPlayCaravanSetup(
							card,
							game.caravans[caravanId as CaravanId]
						);

						if (playResult.allowed) {
							allowedActions.push(
								{
									type: 'PLAY_CARD_TO_CARAVAN',
									cardSel: card,
									caravanId: caravanId as CaravanId,
									playerId: playerId
								}
							)
						}
					}					
				}
			}
			return allowedActions
		}

		case 'main': {

			// Check for all playable cards for each caravan
			for (const card of game[playerId].hand) {
				for (const caravanId in game.caravans) {

					// Play values to self Caravan
					if (!isFaceCard(card)) {
						if (caravanId[0] as string === playerId[0] as string) {
			
							const playResult = gameRules.canPlayToCaravan(
								card,
								game.caravans[caravanId as CaravanId]
							);
							
							if (playResult.allowed) {
								allowedActions.push(
									{
										type: 'PLAY_CARD_TO_CARAVAN',
										cardSel: card,
										caravanId: caravanId as CaravanId,
										playerId: playerId
									}
								)
							}
						}					
					} else { // Face card action search

							for (const caravanCard of game.caravans[caravanId as CaravanId]) {
								const playResult = gameRules.canAttachCard(card, caravanCard)
								if (playResult.allowed) {
								allowedActions.push(
									{
										type: 'ATTACH_CARD',
										cardSel: card,
										targetSel: caravanCard,
										caravanId: caravanId as CaravanId,
										playerId: playerId
									}
								)
							}
							}
						
					}
				}
			}

		}
	}
  return allowedActions;
}


// Game Rules
export type PlayResult =
  | { allowed: true }
  | { allowed: false; reason: string }
  | {allowed: null};

export const gameRules = {
	
	canPlayCaravanSetup(
		cardSel: Card,
		caravan: Card[]
	): PlayResult {
		
		if (!cardSel) {
			return { allowed: null };
		} else if (isFaceCard(cardSel)) {    
			return { allowed: false, reason: 'Figuras não podem abrir uma caravana' };
		} else if (caravan.length > 0) {
			return { allowed: false, reason: 'Já existe cartas nessa caravana' }    
		} else {
			return { allowed: true }
		}
	},

	canPlayToCaravan(
		cardSel: Card,
		caravan: Card[]
	): PlayResult {

		if (!cardSel) {
			return { allowed: null};
		} else if (isFaceCard(cardSel)) {			
				return { allowed: false, reason: 'Figuras devem ser anexadas a carta' };
		}
		const direction = getCaravanDirection(caravan);
		const suit = getCaravanSuit(caravan);

		if (!caravan) {
			return { allowed: false, reason: 'Invalid caravan' };
		} else if (caravan.length === 0) {
			return { allowed: true };
		} else if (cardSel.suit === suit) {
			return { allowed: true}
		} else {
			// Value card rules
			const lastCard = caravan[caravan.length - 1];

			if (cardSel.value === lastCard.value) {
				return { allowed: false, reason: 'Valor igual em sequência não permitido' };
			} else if (direction === null) {
				return { allowed: true };     
			} else if (direction === true && cardSel.value > lastCard.value) {
				return { allowed: true };
			} else if (direction === false && cardSel.value < lastCard.value) {
				return { allowed: true};
			} else {
				return { allowed: false, reason: 'Valor contrário à direção da caravana' };
			}

		}  
	},

	canAttachCard(
		cardSel: Card,
		targetSel: Card,
		): PlayResult {
		if (!cardSel) {
			return { allowed: false, reason: 'Nenhuma carta selecionada' };
		} else if (!isFaceCard(cardSel)) {
			return { allowed: false, reason: 'Valores não podem ser anexados' };
		}  else if (!targetSel) {
			return { allowed: false, reason: 'Nenhuma carta alvo' };
		} else if (isFaceCard(targetSel)) {
			return { allowed: false, reason: 'Figuras devem ser anexas a um valor' };
		} else if (isFaceCard(targetSel) && cardSel.value === 'J') {
			return { allowed: false, reason: 'Valete deve ser anexado a um valor' };
		} else {
			return { allowed: true };  
		
		}
	}
}