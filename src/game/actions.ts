import { type Card, type Player, type CaravanId, isFaceCard } from './types';
import { type GameState } from './turns';

export type CardSelect = {
  card: Card;
  origin: 'player-hand' | 'enemy-hand' | CaravanId;
} | null;

export const gameActions = {
	
	playCardToCaravan: (
    game: GameState, 
    cardSel: CardSelect, 
    caravanId: CaravanId
  ): GameState => {
    // Modify the existing player object instead of spreading
    const newHand = game.player.hand.filter(c => c.id !== cardSel?.card.id);
    game.player.hand = newHand;

    return {
      ...game,
      caravans: {
        ...game.caravans,
        [caravanId]: [...game.caravans[caravanId], cardSel?.card]
      }
      // Don't spread player - keep the class instance
    };
  },

  attachCardToCard: (
    game: GameState,
    cardSel: CardSelect,
    targetSel: CardSelect,
    caravanId: CaravanId
  ): GameState => {    

    // Modify the existing player object instead of spreading
    const newHand = game.player.hand.filter(c => c.id !== cardSel?.card.id);
    game.player.hand = newHand;    

    return {
      ...game,

      caravans: {
        ...game.caravans,
        [caravanId]: game.caravans[caravanId].map(card => {
          if (card.id === targetSel?.card.id) {
            return {
              ...card,
              attachments: [...(card.attachments ?? []), cardSel?.card],
            };
          }

          return card;
        }),
      },
    };
  },


	drawCard(player: Player): Player {
    if (player.deck.length === 0) return player;

    const [card, ...restDeck] = player.deck;

    return {
      ...player,
      deck: restDeck,
      hand: [...player.hand, card],
    };
  },


  discardCard(player: Player, cardSel: CardSelect): Player {
  const card = player.hand.find(c => c.id === cardSel?.card.id);
  if (!card) return player;

  return {
    ...player,
    hand: player.hand.filter(c => c.id !== cardSel?.card.id),
    discardPile: [...player.discardPile, card],
    };
  },

  drawHand(player: Player): Player {
    let newPlayer = player

    for (let i = 0; i < 8 ; i++ ) {
      newPlayer = this.drawCard(newPlayer)         
    }

    return {
      ...player,
      deck: newPlayer.deck,
      hand: newPlayer.hand,      
    }
  },

  discardCaravan: (game: GameState, caravanId: CaravanId): GameState => {
    return {
      ...game,
      caravans: {
        ...game.caravans,
        [caravanId]: []
      }
    }
  },

  removeCaravanCard: (game: GameState, cardSel: CardSelect): GameState => {
    if (!cardSel?.card) {
      throw new Error('removeCard called without a card');
    }

    const origin = cardSel?.origin as CaravanId;

    return {
      ...game,
      caravans: {
        ...game.caravans,
        [origin]: game.caravans[origin].filter(
          card => card.id !== cardSel?.card.id
        ),
      },
    };
  },
};

export function getCaravanScore(cards: Card[]) {
  let score = 0;
  for (const card of cards) {
    if (isFaceCard(card)) continue;
    else score += card.value as number;  
  }
  return score;
}

const getCaravanDirection = (cards: Card[]): boolean | null => {
    // true ascending, false descending, null undefined
    if (cards.length < 2) {
      return null
    }	
    else if (cards[0].value > cards[1].value) {
      return false
    } else {
      return true
    }
  }

const getCaravanSuit= (cards: Card[]): string | null => {
    if (cards.length === 0) return null;
    return cards[cards.length - 1].suit;
}

// Game rules
export type PlayResult =
  | { allowed: true }
  | { allowed: false; reason: string }
  | {allowed: null};


export function canPlayToCaravan(
  state: GameState,
  cardSel: CardSelect,
  caravanId: CaravanId
): PlayResult {

  if (!cardSel) {
    return { allowed: null};
  } else if (isFaceCard(cardSel.card)) {
    if (cardSel.card.value === "Q") {
      return { allowed: true }
    } else {
      return { allowed: false, reason: 'Rei e Valete não podem ser jogados diretamente na caravana' };
    }
  }

  const caravan = state.caravans[caravanId];
  const direction = getCaravanDirection(caravan);
  const suit = getCaravanSuit(caravan);

  if (!caravan) {
    return { allowed: false, reason: 'Invalid caravan' };
  } else if (caravan.length === 0) {
    return { allowed: true };
  } else if (cardSel.card.suit === suit) {
    return { allowed: true}
  } else {
    // Value card rules
    const lastCard = caravan[caravan.length - 1];

    if (cardSel.card.value === lastCard.value) {
      return { allowed: false, reason: 'Valor igual em sequência não permitido' };
    } else if (direction === null) {
      return { allowed: true };     
    } else if (direction === true && cardSel.card.value > lastCard.value) {
      return { allowed: true };
    } else if (direction === false && cardSel.card.value < lastCard.value) {
      return { allowed: true};
    } else {
      return { allowed: false, reason: 'Valor contrário à direção da caravana' };
    }

  }  
}

export const canAttachCard = (
  cardSel: CardSelect,
  targetSel: CardSelect,
  ): PlayResult => {
  if (!cardSel) {
    return { allowed: false, reason: 'Nenhuma carta selecionada' };
  } else if (!isFaceCard(cardSel.card) || cardSel.card.value === 'Q') {
    return { allowed: false, reason: 'Valores e Dama não podem ser anexados' };
  }  else if (!targetSel) {
    return { allowed: false, reason: 'Nenhuma carta alvo' };
  } else if (isFaceCard(targetSel.card)) {
    return { allowed: false, reason: 'Figuras devem ser anexas a uma carta de valor' };
  } else {
    return { allowed: true };  
  
  }
}
