// Card types and deck creation
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = [1,2,3,4,5,6,7,8,9,10,'J','Q','K'] as const;

export type Suit = typeof SUITS[number];
export type Value = typeof RANKS[number];

export interface Card {
  id: string;
	suit: Suit;
  value: Value;
	attachments?: Card[];
}

export function isFaceCard(card: Card): boolean {
  if (!card) {
		console.log(card)
    throw new Error('Invalid card passed to isFaceCard');
  }

  return card.value === 'J' || card.value === 'Q' || card.value === 'K';
}
export const createDeck = () => {
  return SUITS.flatMap(suit =>
    RANKS.map(value => ({ id: crypto.randomUUID(), suit, value }))
  );

	/* cards_suits.push(
		{ id: crypto.randomUUID(), suit: 'Joker', rank: 'Joker' },
		{ id: crypto.randomUUID(), suit: 'Joker', rank: 'Joker' },
	) */
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

