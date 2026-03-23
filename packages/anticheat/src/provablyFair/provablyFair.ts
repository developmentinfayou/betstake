import { createHash, randomBytes } from 'crypto';
import { ProvablyFairSeed, RngOutcome, ProvablyFairVerification } from '../types';

export class ProvablyFairService {
  /**
   * Generate a new server seed and its commitment hash.
   */
  generateServerSeed(): { serverSeed: string; serverSeedHash: string } {
    const serverSeed = randomBytes(32).toString('hex');
    const serverSeedHash = this.sha256(serverSeed);
    return { serverSeed, serverSeedHash };
  }

  /**
   * Compute SHA-256 hash of input.
   */
  sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  /**
   * Derive a deterministic random value from seeds + nonce.
   * R = SHA256(serverSeed || clientSeed || nonce)
   */
  deriveRandom(serverSeed: string, clientSeed: string, nonce: number): string {
    const combined = `${serverSeed}${clientSeed}${nonce}`;
    return this.sha256(combined);
  }

  /**
   * Derive colour assignment: WHITE or BLACK.
   */
  deriveColour(
    serverSeed: string,
    clientSeed: string,
    nonce: number
  ): RngOutcome {
    const hash = this.deriveRandom(serverSeed, clientSeed, nonce);
    const value = parseInt(hash.slice(0, 8), 16);
    const colour = value % 2 === 0 ? 'WHITE' : 'BLACK';

    return {
      purpose: 'colour',
      nonce,
      derivedHash: hash,
      result: colour,
    };
  }


  /**
   * Derive a generic random integer in [0, max).
   */
  deriveRandomInt(
    serverSeed: string,
    clientSeed: string,
    nonce: number,
    max: number,
    purpose: RngOutcome['purpose'] = 'tiebreaker'
  ): RngOutcome {
    const hash = this.deriveRandom(serverSeed, clientSeed, nonce);
    const value = parseInt(hash.slice(0, 8), 16);
    const result = value % max;

    return {
      purpose,
      nonce,
      derivedHash: hash,
      result,
    };
  }

  /**
   * Verify that a serverSeed matches a previously committed hash,
   * and that the derived outcome is correct.
   */
  verify(
    serverSeed: string,
    serverSeedHash: string,
    clientSeed: string,
    nonce: number,
    purpose: RngOutcome['purpose'],
    claimedResult: string | number
  ): ProvablyFairVerification {
    const computedHash = this.sha256(serverSeed);
    const match = computedHash === serverSeedHash;

    let derivedOutcome: string | number;
    const hash = this.deriveRandom(serverSeed, clientSeed, nonce);
    const value = parseInt(hash.slice(0, 8), 16);

    switch (purpose) {
      case 'colour':
        derivedOutcome = value % 2 === 0 ? 'WHITE' : 'BLACK';
        break;
      default:
        derivedOutcome = value;
        break;
    }

    return {
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonce,
      expectedHash: serverSeedHash,
      computedHash,
      match: match && derivedOutcome === claimedResult,
      derivedOutcome,
    };
  }

  /**
   * Create a full seed set for a new game.
   */
  createGameSeeds(clientSeedWhite: string, clientSeedBlack: string): {
    serverSeed: string;
    serverSeedHash: string;
    clientSeedWhite: string;
    clientSeedBlack: string;
    combinedClientSeed: string;
  } {
    const { serverSeed, serverSeedHash } = this.generateServerSeed();
    // Combine both client seeds deterministically
    const combinedClientSeed = this.sha256(clientSeedWhite + clientSeedBlack);

    return {
      serverSeed,
      serverSeedHash,
      clientSeedWhite,
      clientSeedBlack,
      combinedClientSeed,
    };
  }
}
