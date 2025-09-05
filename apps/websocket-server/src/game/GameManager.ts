import { LobbyManager } from '../lobby/LobbyManager';
import { BattleManager } from '../battle/BattleManager';

export class GameManager {
  private lobbyManager: LobbyManager;
  private battleManager: BattleManager;

  constructor(lobbyManager: LobbyManager, battleManager: BattleManager) {
    this.lobbyManager = lobbyManager;
    this.battleManager = battleManager;
  }

  // Game state management methods can be added here
  // This class can coordinate between lobby and battle managers
  // and handle complex game logic that spans multiple systems
}
