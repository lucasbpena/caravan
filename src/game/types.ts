// Card types and deck creation
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = [1,2,3,4,5,6,7,8,9,10,'J','Q','K'] as const;

export type Suit = typeof SUITS[number];
export type Value = typeof RANKS[number];

export type CardId = `${string}-${string}-${string}-${string}-${string}`

export type CardStatus = 
	| 'idle'	
	| 'entering'
	| 'attaching'	
	| 'destroying'
	| 'dicarding';

export type Card  = 
  | {
	id: CardId;
	suit: Suit;
  	value: Value;
	attachments?: Card[];
	cardStatus?: CardStatus
	}
	| {
	id: CardId;
	value: 'Joker1' | 'Joker2'
	suit: 'Joker1' | 'Joker2'
	attachments?: Card[];
	cardStatus?: CardStatus
	}

export function isFaceCard(card: Card): boolean {
  if (!card) {
		console.log(card)
    throw new Error('Invalid card passed to isFaceCard');
  }

  return card.value === 'J' || card.value === 'Q' || card.value === 'K' || card.value === 'Joker1' || card.value === 'Joker2';
}

export function shuffleDeck<T>(deck: T[]): T[] {
	const shuffled = [...deck]; // don’t mutate input
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}


export function createDeck(): Card[] {
	const deck: Card[] = [];

	// Normal cards
	for (const suit of SUITS) {
		for (const value of RANKS) {
			deck.push({
				id: crypto.randomUUID(),
				suit,
				value,
			});
		}
	}

	// Jokers
	deck.push(
		{
			id: crypto.randomUUID(),
			suit: 'Joker1',
			value: 'Joker1',
		},
		{
			id: crypto.randomUUID(),
			suit: 'Joker2',
			value: 'Joker2',
		}
	);

	return shuffleDeck(deck);
}


// Player types
export type Player = {
	deck: Card[] 
	hand: Card[] 
	discardPile: Card[]
}

// Game types
export const PLAYER_CARAVANS = ['p-1', 'p-2', 'p-3'] as const;
export const ENEMY_CARAVANS  = ['e-1', 'e-2', 'e-3'] as const;

export type CaravanId =
	| typeof PLAYER_CARAVANS[number]
	| typeof ENEMY_CARAVANS[number];

