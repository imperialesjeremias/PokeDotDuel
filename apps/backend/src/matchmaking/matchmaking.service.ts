import { Injectable, Logger } from '@nestjs/common';
import { Bracket, LobbyStatus, QueueStatus, MatchmakingStatus } from '../shared/interfaces/types';

@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

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

  constructor() {
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
      this.logger.log(`Added lobby ${lobbyId} to bracket ${bracketId} queue`);
    }
  }

  removeFromQueue(lobbyId: string, bracketId: number): void {
    const queue = this.waitingQueues.get(bracketId);
    if (queue) {
      const index = queue.indexOf(lobbyId);
      if (index !== -1) {
        queue.splice(index, 1);
        this.logger.log(`Removed lobby ${lobbyId} from bracket ${bracketId} queue`);
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
          this.logger.error(`Failed to match lobbies ${lobby1} and ${lobby2}:`, error);
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
        this.logger.log(`Removed inactive lobby ${lobbyId} from bracket ${bracketId}`);
      }
    }
  }

  private async matchLobbies(lobby1Id: string, lobby2Id: string, bracketId: number): Promise<void> {
    // This will be implemented when we integrate with the lobby service
    // For now, just log the match attempt
    this.logger.log(`Attempting to match lobbies ${lobby1Id} and ${lobby2Id} in bracket ${bracketId}`);

    // TODO: Implement actual lobby matching logic with lobby service
    throw new Error('Lobby matching not yet implemented');
  }

  getQueueStatus(bracketId: number): QueueStatus {
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

  getAllQueueStatuses(): Record<number, QueueStatus> {
    const statuses: Record<number, QueueStatus> = {};

    for (const bracket of this.brackets) {
      statuses[bracket.id] = this.getQueueStatus(bracket.id);
    }

    return statuses;
  }

  getMatchmakingStatus(): MatchmakingStatus {
    return {
      brackets: this.brackets,
      queues: this.getAllQueueStatuses(),
    };
  }
}

