import { LobbyManager } from './LobbyManager';

export interface Bracket {
  id: number;
  minWager: number;
  maxWager: number;
  name: string;
  description: string;
}

export class Matchmaker {
  private brackets: Bracket[] = [
    { id: 1, minWager: 0.01 * 1_000_000_000, maxWager: 0.05 * 1_000_000_000, name: 'Bronze', description: '0.01 - 0.05 SOL' },
    { id: 2, minWager: 0.05 * 1_000_000_000, maxWager: 0.1 * 1_000_000_000, name: 'Silver', description: '0.05 - 0.1 SOL' },
    { id: 3, minWager: 0.1 * 1_000_000_000, maxWager: 0.5 * 1_000_000_000, name: 'Gold', description: '0.1 - 0.5 SOL' },
    { id: 4, minWager: 0.5 * 1_000_000_000, maxWager: 1 * 1_000_000_000, name: 'Platinum', description: '0.5 - 1 SOL' },
    { id: 5, minWager: 1 * 1_000_000_000, maxWager: 5 * 1_000_000_000, name: 'Diamond', description: '1 - 5 SOL' },
    { id: 6, minWager: 5 * 1_000_000_000, maxWager: Number.MAX_SAFE_INTEGER, name: 'Master', description: '5+ SOL' },
  ];

  private waitingQueues: Map<number, string[]> = new Map(); // bracketId -> lobbyIds
  private lastActivity: Map<string, number> = new Map(); // lobbyId -> timestamp

  constructor(private lobbyManager: LobbyManager) {
    // Initialize queues for each bracket
    this.brackets.forEach(bracket => {
      this.waitingQueues.set(bracket.id, []);
    });

    // Start matchmaking loop
    setInterval(() => this.processMatches(), 5000); // Check every 5 seconds
  }

  getBrackets(): Bracket[] {
    return this.brackets;
  }

  getBracketForWager(wagerLamports: number): Bracket | null {
    return this.brackets.find(bracket =>
      wagerLamports >= bracket.minWager && wagerLamports <= bracket.maxWager
    ) || null;
  }

  addToQueue(lobbyId: string, bracketId: number): void {
    const queue = this.waitingQueues.get(bracketId);
    if (queue && !queue.includes(lobbyId)) {
      queue.push(lobbyId);
      this.lastActivity.set(lobbyId, Date.now());
    }
  }

  removeFromQueue(lobbyId: string, bracketId: number): void {
    const queue = this.waitingQueues.get(bracketId);
    if (queue) {
      const index = queue.indexOf(lobbyId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }
    this.lastActivity.delete(lobbyId);
  }

  private async processMatches(): Promise<void> {
    for (const [bracketId, queue] of this.waitingQueues.entries()) {
      if (queue.length >= 2) {
        const lobby1 = queue.shift()!;
        const lobby2 = queue.shift()!;

        try {
          // Try to match these lobbies
          await this.matchLobbies(lobby1, lobby2, bracketId);
        } catch (error) {
          console.error('Failed to match lobbies:', error);
          // Put lobbies back in queue
          queue.unshift(lobby2);
          queue.unshift(lobby1);
        }
      }

      // Remove inactive lobbies (older than 5 minutes)
      const now = Date.now();
      const inactiveLobbies: string[] = [];

      for (const lobbyId of queue) {
        const lastActive = this.lastActivity.get(lobbyId) || 0;
        if (now - lastActive > 5 * 60 * 1000) { // 5 minutes
          inactiveLobbies.push(lobbyId);
        }
      }

      // Remove inactive lobbies from queue
      for (const lobbyId of inactiveLobbies) {
        this.removeFromQueue(lobbyId, bracketId);
      }
    }
  }

  private async matchLobbies(lobby1Id: string, lobby2Id: string, bracketId: number): Promise<void> {
    const lobby1 = this.lobbyManager.getLobby(lobby1Id);
    const lobby2 = this.lobbyManager.getLobby(lobby2Id);

    if (!lobby1 || !lobby2) {
      throw new Error('One or both lobbies not found');
    }

    if (lobby1.status !== 'OPEN' || lobby2.status !== 'OPEN') {
      throw new Error('One or both lobbies are not available for matching');
    }

    // Find opponent for lobby1 from lobby2
    if (!lobby1.opponentId && lobby2.creatorId !== lobby1.creatorId) {
      // Match lobby1 with lobby2's creator
      await this.lobbyManager.joinLobby(lobby1Id, lobby2.creatorId, lobby2.creatorSocketId!);
    } else if (!lobby2.opponentId && lobby1.creatorId !== lobby2.creatorId) {
      // Match lobby2 with lobby1's creator
      await this.lobbyManager.joinLobby(lobby2Id, lobby1.creatorId, lobby1.creatorSocketId!);
    } else {
      throw new Error('No valid match found');
    }
  }

  getQueueStatus(bracketId: number): { queueLength: number; estimatedWaitTime: number } {
    const queue = this.waitingQueues.get(bracketId) || [];
    const queueLength = queue.length;

    // Estimate wait time based on queue length (rough calculation)
    let estimatedWaitTime = 0;
    if (queueLength >= 2) {
      estimatedWaitTime = 5; // seconds
    } else if (queueLength === 1) {
      estimatedWaitTime = 15; // seconds
    } else {
      estimatedWaitTime = 30; // seconds
    }

    return { queueLength, estimatedWaitTime };
  }

  getAllQueueStatuses(): Record<number, { queueLength: number; estimatedWaitTime: number }> {
    const statuses: Record<number, { queueLength: number; estimatedWaitTime: number }> = {};

    for (const bracket of this.brackets) {
      statuses[bracket.id] = this.getQueueStatus(bracket.id);
    }

    return statuses;
  }
}
