import { type GameAction, type GameState, type PlayerId } from "../game/turns";
import { getLegalActions } from "../game/rules";

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
