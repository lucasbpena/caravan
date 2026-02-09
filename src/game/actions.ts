import { type Card, type CaravanId } from './types';
import { type GameState, type PlayerId } from './turns';

// Find card location helper
export function findCardLocation(
  game: GameState,
  cardId: string
): CaravanId | PlayerId | null {
  // Search caravans
  for (const [caravanId, cards] of Object.entries(game.caravans)) {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      return caravanId as CaravanId
      };
    }
  // Search player hands
  const players: PlayerId[] = ['player', 'enemy'];

  for (const playerId of players) {
    const card = game[playerId].hand.find(c => c.id === cardId);
    if (card) {
      return playerId as PlayerId;
    }
  }

  return null;
}

// Joker effect helper
function applyJokerEffectGlobal(
  caravans: GameState['caravans'],
  targetCard: Card,
  joker: Card
): GameState['caravans'] {
  const nextCaravans: GameState['caravans'] = {} as Record<CaravanId, Card[]>;

  for (const [caravanId, cards] of Object.entries(caravans)) {
    nextCaravans[caravanId as CaravanId] = cards.map(card => {

      // TARGET CARD: survives, but keeps the Joker attached
      if (card.id === targetCard.id) {
        return {
          ...card,
          attachments: [...(card.attachments ?? []), joker],
        };
      }

      // Determine match rule
      const matches =
        targetCard.value === 1
          ? card.suit === targetCard.suit        // Ace → suit wipe
          : card.value === targetCard.value;     // Value wipe

      if (!matches || card.cardStatus === 'destroying') {
        return card;
      }

      // Destroy matched cards
      return {
        ...card,
        cardStatus: 'destroying',
        attachments: card.attachments?.map(att => ({
          ...att,
          cardStatus: 'destroying',
        })),
      };
    });
  }

  return nextCaravans;
}

export type HoverTarget =
  | { type:'caravan'; owner: PlayerId; caravanId: CaravanId }
  | { type: 'placed'; owner: PlayerId; card: Card; caravanId: CaravanId }
  | { type: 'deck'};

// Game actions
export const gameActions = {
	
	playCardToCaravan(
    game: GameState,
    cardId: string,
    targetCaravanId: CaravanId,
    playerId: PlayerId
  ): GameState {

    // Play and draw
    const hand = game[playerId].hand.filter(c => c.id !== cardId)        
    const card = game[playerId as PlayerId].hand.filter(c => c.id === cardId)[0]
    card.cardStatus = 'entering'
    const [drawn, ...restDeck] = game[playerId].deck

    // Deactivate all active Queens in the target caravan (new card becomes new suit)
    const updatedCaravan = game.caravans[targetCaravanId].map(c => {
      if (!c.attachments) return c;
      
      const updatedAttachments = c.attachments.map(att =>
        att.value === 'Q' && att.cardStatus === 'active'
          ? { ...att, cardStatus: 'attaching' as const }
          : att
      );
      
      return { ...c, attachments: updatedAttachments };
    });

    return {
      ...game,
      [playerId]: {
        ...[playerId],
        hand: [...hand, drawn],
        deck: restDeck
      },
      caravans: {
        ...game.caravans,
        [targetCaravanId]: [...updatedCaravan, card,]  // <- Changed from game.caravans[targetCaravanId] to updatedCaravan
      },
    };
  },

  attachCardToCard(
    game: GameState,
    sourceCardId: string,
    targetCardId: string,
    playerId: PlayerId
  ): GameState {
    const source = game[playerId].hand.find(c => c.id === sourceCardId);    
    if (!source) return game;

    source.cardStatus = 'attaching'

    const targetLoc = findCardLocation(game, targetCardId);
    if (!targetLoc) return game;

    const targetCaravanId = targetLoc;

    // Draw    
    const hand = game[playerId].hand.filter(c => c.id !== sourceCardId)
    const [drawn, ...restDeck] = game[playerId].deck

    // Jack effects
    if (source.value === 'J') {
      source.cardStatus = 'destroying'
      return {
        ...game,
        [playerId]: {
          ...game[playerId],
          hand: [...hand, drawn],
          deck: restDeck,
        },
        caravans: {
          ...game.caravans,
          [targetCaravanId]: game.caravans[targetCaravanId as CaravanId].map(card =>
            card.id === targetCardId
              ? {
                  ...card,
                  cardStatus: 'destroying',
                  attachments: [...(card.attachments ?? []), source].map(att => ({
                  ...att,
                  cardStatus: 'destroying',
                })),
                }
              : card
          ),
          
        },
      };
    // Joker effects
    } else if (source.value === 'Joker1' || source.value === 'Joker2') {
        const targetCard = game.caravans[targetCaravanId as CaravanId].find(
          c => c.id === targetCardId
        );
        if (!targetCard) return game;

        return {
          ...game,
          [playerId]: {
            ...game[playerId],
            hand: [...hand, drawn],
            deck: restDeck,
          },
          caravans: applyJokerEffectGlobal(
            game.caravans,
            targetCard,
            source
          ),
        };
      // Queen: mark as 'active', deactivate all other Queens in the same caravan
      } else if (source.value === 'Q') {
        
        source.cardStatus = 'active';
        
        return {
          ...game,
          [playerId]: {
            ...game[playerId],
            hand: [...hand, drawn],
            deck: restDeck
          },
          caravans: {
            ...game.caravans,
            [targetCaravanId]: game.caravans[targetCaravanId as CaravanId].map(card => {
              if (card.id === targetCardId) {
                // Attach Queen to target card
                return {
                  ...card,
                  attachments: [...(card.attachments ?? []), source],
                };
              } else {
                // Deactivate any other Queens in this caravan
                const updatedAttachments = card.attachments?.map(att => 
                  att.value === 'Q' && att.cardStatus === 'active'
                    ? { ...att, cardStatus: 'attaching' as const }
                    : att
                );
                
                return updatedAttachments 
                  ? { ...card, attachments: updatedAttachments }
                  : card;
              }
            }),
          },
        };
      }   

      else {
        return {
          ...game,
          [playerId]: {
            ...game[playerId],
            hand: [...hand, drawn],
            deck: restDeck
          },
          caravans: {
            ...game.caravans,
            [targetCaravanId]: game.caravans[targetCaravanId as CaravanId].map(card =>
              card.id === targetCardId
                ? {
                    ...card,
                    attachments: [...(card.attachments ?? []), source],
                  }
                : card
            ),
          },
        };
      }   
  },

  discardAndDraw(
    game: GameState,
    playerId: PlayerId,
    cardId: string
  ): GameState {
    const player = game[playerId];
    const card = player.hand.find(c => c.id === cardId);
    if (!card || player.deck.length === 0) return game;

    const [drawn, ...restDeck] = player.deck;

    return {
      ...game,
      [playerId]: {
        ...player,
        hand: [...player.hand.filter(c => c.id !== cardId), drawn],
        deck: restDeck,
        //discardPile: [...player.discardPile, card],
      },
    };
  },

	drawCard(game: GameState, playerId: PlayerId): GameState {
    const player = game[playerId];
    const deck = game[playerId].deck;

    if (deck.length === 0) return game;

    const [drawn, ...restDeck] = player.deck;

    return {
      ...game,
      [playerId]: {
        ...player,
        hand: [...player.hand, drawn],
        deck: restDeck
      },    
    };
  },

  drawHand(
    game: GameState,
    playerId: PlayerId
  ): GameState {
    let gameChange = game

    for (let i = 0; i < 8 ; i++ ) {
      gameChange = this.drawCard(gameChange, playerId)         
    }
    
    return gameChange
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

};
