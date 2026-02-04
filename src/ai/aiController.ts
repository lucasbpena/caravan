import { type GameAction, type GameState, type PlayerId } from "../game/turns";
import { getCaravanScore, getLegalActions } from "../game/rules";
import type { CaravanId } from "../game/types";

export function decideAiAction(
  game: GameState,
  aiPlayerId: PlayerId
): GameAction {
  // Get legal actions
  const legalActions = getLegalActions(game, aiPlayerId);
 
  // Choose random
  const randomActionSel = legalActions[Math.floor(Math.random() * legalActions.length)];
  
  return randomActionSel
  
}


function evaluateGame(game: GameState, me: PlayerId): number {
  let score = 0;

  for (const caravan in game.caravans) {
    const value = getCaravanScore(game.caravans[caravan as CaravanId]);

    let caravanScore = 0;

    if (value > 26) caravanScore -= 100;
    else if (value >= 21) caravanScore += 50;
    else caravanScore += value;

    // Stability bonus
    caravanScore += caravan.faceCards.length * 5;

    // Risk penalty
    if (value >= 24 && value <= 26) caravanScore -= 10;

    score += owner === me ? caravanScore : -caravanScore;
  }

  return score;
}
