import { ChildProcess, spawn } from 'child_process';
import { EngineCandidate } from '../types';

interface StockfishInstance {
  process: ChildProcess;
  busy: boolean;
  id: number;
}

interface AnalysisResult {
  bestMove: string;
  eval: number; // centipawns (from side-to-move perspective)
  topMoves: EngineCandidate[];
  depth: number;
}

export class StockfishPool {
  private pool: StockfishInstance[] = [];
  private queue: Array<{
    fen: string;
    depth: number;
    multiPv: number;
    resolve: (result: AnalysisResult) => void;
    reject: (err: Error) => void;
  }> = [];

  constructor(
    private poolSize: number = 4,
    private stockfishPath: string = 'stockfish'
  ) {}

  async init(): Promise<void> {
    for (let i = 0; i < this.poolSize; i++) {
      const instance = await this.createInstance(i);
      this.pool.push(instance);
    }
  }

  private async createInstance(id: number): Promise<StockfishInstance> {
    const proc = spawn(this.stockfishPath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const instance: StockfishInstance = { process: proc, busy: false, id };

    // Wait for UCI readiness
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Stockfish init timeout')), 10000);
      const onData = (data: Buffer) => {
        if (data.toString().includes('uciok')) {
          clearTimeout(timeout);
          proc.stdout!.off('data', onData);
          resolve();
        }
      };
      proc.stdout!.on('data', onData);
      proc.stdin!.write('uci\n');
    });

    // Set reasonable defaults
    proc.stdin!.write('setoption name Threads value 1\n');
    proc.stdin!.write('setoption name Hash value 64\n');
    proc.stdin!.write('isready\n');

    await new Promise<void>((resolve) => {
      const onData = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          proc.stdout!.off('data', onData);
          resolve();
        }
      };
      proc.stdout!.on('data', onData);
    });

    return instance;
  }

  async analyse(fen: string, depth: number = 18, multiPv: number = 3): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fen, depth, multiPv, resolve, reject });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    const available = this.pool.find((inst) => !inst.busy);
    if (!available) return;

    const job = this.queue.shift()!;
    available.busy = true;

    this.runAnalysis(available, job.fen, job.depth, job.multiPv)
      .then((result) => {
        available.busy = false;
        job.resolve(result);
        this.processQueue();
      })
      .catch((err) => {
        available.busy = false;
        job.reject(err);
        this.processQueue();
      });
  }

  private async runAnalysis(
    instance: StockfishInstance,
    fen: string,
    depth: number,
    multiPv: number
  ): Promise<AnalysisResult> {
    const proc = instance.process;
    const stdin = proc.stdin!;
    const stdout = proc.stdout!;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        stdin.write('stop\n');
        reject(new Error('Stockfish analysis timeout'));
      }, 30000);

      const lines: string[] = [];
      let bestMove = '';

      const onData = (data: Buffer) => {
        const text = data.toString();
        for (const line of text.split('\n')) {
          lines.push(line.trim());
          if (line.startsWith('bestmove')) {
            bestMove = line.split(' ')[1] || '';
            clearTimeout(timeout);
            stdout.off('data', onData);

            const result = this.parseAnalysisOutput(lines, bestMove, depth, multiPv);
            resolve(result);
          }
        }
      };

      stdout.on('data', onData);

      stdin.write('ucinewgame\n');
      stdin.write(`setoption name MultiPV value ${multiPv}\n`);
      stdin.write(`position fen ${fen}\n`);
      stdin.write(`go depth ${depth}\n`);
    });
  }

  private parseAnalysisOutput(
    lines: string[],
    bestMove: string,
    targetDepth: number,
    multiPv: number
  ): AnalysisResult {
    const topMoves: EngineCandidate[] = [];
    let mainEval = 0;

    // Parse info lines for the deepest available depth
    const infoLines = lines
      .filter((l) => l.startsWith('info') && l.includes('depth') && l.includes(' pv '))
      .reverse();

    const seen = new Set<number>();
    for (const line of infoLines) {
      const pvMatch = line.match(/multipv (\d+)/);
      const pvNum = pvMatch ? parseInt(pvMatch[1]) : 1;
      if (seen.has(pvNum)) continue;
      seen.add(pvNum);

      const depthMatch = line.match(/depth (\d+)/);
      const depth = depthMatch ? parseInt(depthMatch[1]) : 0;

      let evalCp = 0;
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      if (cpMatch) {
        evalCp = parseInt(cpMatch[1]);
      } else if (mateMatch) {
        const mateIn = parseInt(mateMatch[1]);
        evalCp = mateIn > 0 ? 30000 - mateIn * 100 : -30000 - mateIn * 100;
      }

      const pvIndex = line.indexOf(' pv ');
      const move = pvIndex >= 0 ? line.substring(pvIndex + 4).split(' ')[0] : '';

      if (move) {
        topMoves.push({ move, eval: evalCp, rank: pvNum });
      }

      if (pvNum === 1) {
        mainEval = evalCp;
      }

      if (seen.size >= multiPv) break;
    }

    topMoves.sort((a, b) => a.rank - b.rank);

    return {
      bestMove,
      eval: mainEval,
      topMoves,
      depth: targetDepth,
    };
  }

  async shutdown(): Promise<void> {
    for (const instance of this.pool) {
      instance.process.stdin!.write('quit\n');
      instance.process.kill();
    }
    this.pool = [];
  }
}
