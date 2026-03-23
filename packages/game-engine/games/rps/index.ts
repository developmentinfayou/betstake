import { generateFloat, generateServerSeed, hashServerSeed, generateClientSeed } from '@casino/fairness';
import { RPSChoice, RPSMode, RPSGameState, RPSRound } from './types';

export class RPSGame {
    /**
     * Initialize new RPS game
     */
    static initializeGame(
        players: Array<{ userId: string; username: string }>,
        mode: RPSMode,
        serverSeed?: string
    ): RPSGameState {
        if (players.length !== 2) {
            throw new Error('RPS requires exactly 2 players');
        }

        const seed = serverSeed || generateServerSeed();

        const clientSeeds: Record<string, string> = {};
        players.forEach(p => {
            clientSeeds[p.userId] = generateClientSeed();
        });

        const scores: Record<string, number> = {};
        players.forEach(p => {
            scores[p.userId] = 0;
        });

        // Create all rounds upfront
        const totalRounds = this.getTotalRounds(mode);
        const rounds: RPSRound[] = [];
        for (let i = 1; i <= totalRounds; i++) {
            rounds.push({
                roundNumber: i,
                player1Choice: null,
                player2Choice: null,
                winner: null
            });
        }

        return {
            players,
            rounds,
            currentRound: 1,
            scores,
            mode,
            winner: null,
            serverSeed: seed,
            serverSeedHash: hashServerSeed(seed),
            clientSeeds,
            nonce: 0
        };
    }

    /**
     * Submit a player's choice for the current round
     */
    static submitChoice(
        state: RPSGameState,
        playerId: string,
        choice: RPSChoice
    ): { success: boolean; error?: string } {
        const playerIndex = state.players.findIndex(p => p.userId === playerId);
        if (playerIndex === -1) {
            return { success: false, error: 'Player not in game' };
        }

        const round = state.rounds[state.currentRound - 1];
        if (!round) {
            return { success: false, error: 'Invalid round' };
        }

        // Check if player already picked
        if (playerIndex === 0 && round.player1Choice !== null) {
            return { success: false, error: 'Already picked' };
        }
        if (playerIndex === 1 && round.player2Choice !== null) {
            return { success: false, error: 'Already picked' };
        }

        // Record choice
        if (playerIndex === 0) {
            round.player1Choice = choice;
        } else {
            round.player2Choice = choice;
        }

        return { success: true };
    }

    /**
     * Check if both players have submitted their choice
     */
    static bothPicked(state: RPSGameState): boolean {
        const round = state.rounds[state.currentRound - 1];
        if (!round) return false;
        return round.player1Choice !== null && round.player2Choice !== null;
    }

    /**
     * Resolve the current round after both players have picked
     */
    static resolveRound(state: RPSGameState): {
        roundNumber: number;
        player1Choice: RPSChoice;
        player2Choice: RPSChoice;
        roundWinner: string; // playerId or 'draw'
        scores: Record<string, number>;
    } | null {
        const round = state.rounds[state.currentRound - 1];
        if (!round || round.player1Choice === null || round.player2Choice === null) {
            return null;
        }

        const winner = this.determineWinner(
            round.player1Choice,
            round.player2Choice,
            state.players[0].userId,
            state.players[1].userId
        );

        round.winner = winner;

        // Update scores (draws don't add points)
        if (winner !== 'draw') {
            state.scores[winner]++;
        }

        const result = {
            roundNumber: round.roundNumber,
            player1Choice: round.player1Choice,
            player2Choice: round.player2Choice,
            roundWinner: winner,
            scores: { ...state.scores }
        };

        // Advance to next round
        state.currentRound++;

        return result;
    }

    /**
     * Check if the match has a winner
     */
    static checkMatchWinner(state: RPSGameState): string | null {
        const requiredWins = this.getRequiredWins(state.mode);

        // Check if either player has enough wins
        for (const [playerId, wins] of Object.entries(state.scores)) {
            if (wins >= requiredWins) {
                state.winner = playerId;
                return playerId;
            }
        }

        // Check if all rounds played (possible draw in BO1)
        const totalRounds = this.getTotalRounds(state.mode);
        if (state.currentRound > totalRounds) {
            // All rounds played — check for overall draw
            const scores = Object.values(state.scores);
            if (scores[0] === scores[1]) {
                state.winner = 'draw';
                return 'draw';
            }
            // One player has more wins
            const winnerId = Object.entries(state.scores).reduce((a, b) =>
                a[1] > b[1] ? a : b
            )[0];
            state.winner = winnerId;
            return winnerId;
        }

        return null;
    }

    /**
     * Auto-pick a choice using provably fair RNG (for timeouts)
     */
    static autoPickChoice(state: RPSGameState, playerId: string): RPSChoice {
        const combinedClientSeed = this.combineClientSeeds(state.clientSeeds);

        const float = generateFloat({
            serverSeed: state.serverSeed,
            clientSeed: combinedClientSeed,
            nonce: state.nonce
        });

        state.nonce++;

        const choices = [RPSChoice.ROCK, RPSChoice.PAPER, RPSChoice.SCISSORS];
        const index = Math.floor(float * 3);
        return choices[index];
    }

    /**
     * Determine round winner from two choices
     */
    static determineWinner(
        choice1: RPSChoice,
        choice2: RPSChoice,
        player1Id: string,
        player2Id: string
    ): string {
        if (choice1 === choice2) return 'draw';

        const winsAgainst: Record<RPSChoice, RPSChoice> = {
            [RPSChoice.ROCK]: RPSChoice.SCISSORS,
            [RPSChoice.PAPER]: RPSChoice.ROCK,
            [RPSChoice.SCISSORS]: RPSChoice.PAPER
        };

        return winsAgainst[choice1] === choice2 ? player1Id : player2Id;
    }

    /**
     * Get required wins to win the match
     */
    static getRequiredWins(mode: RPSMode): number {
        switch (mode) {
            case RPSMode.BO1: return 1;
            case RPSMode.BO3: return 2;
            case RPSMode.BO5: return 3;
        }
    }

    /**
     * Get total rounds for a mode
     */
    static getTotalRounds(mode: RPSMode): number {
        switch (mode) {
            case RPSMode.BO1: return 1;
            case RPSMode.BO3: return 3;
            case RPSMode.BO5: return 5;
        }
    }

    /**
     * Calculate payout (2% house edge)
     */
    static calculatePayout(betAmount: number): {
        winnerPayout: number;
        houseEdge: number;
    } {
        const totalPot = betAmount * 2;
        const houseEdge = totalPot * 0.02;
        const winnerPayout = totalPot - houseEdge;
        return { winnerPayout, houseEdge };
    }

    /**
     * Combine all player client seeds
     */
    private static combineClientSeeds(clientSeeds: Record<string, string>): string {
        return Object.values(clientSeeds).join(':');
    }

    /**
     * Verify auto-pick result
     */
    static verifyAutoPickChoice(
        serverSeed: string,
        clientSeeds: Record<string, string>,
        nonce: number
    ): RPSChoice {
        const combinedClientSeed = this.combineClientSeeds(clientSeeds);
        const float = generateFloat({ serverSeed, clientSeed: combinedClientSeed, nonce });
        const choices = [RPSChoice.ROCK, RPSChoice.PAPER, RPSChoice.SCISSORS];
        return choices[Math.floor(float * 3)];
    }
}

export * from './types';
