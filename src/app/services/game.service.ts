import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Instruction } from '../components/puzzle-pieces/puzzle-pieces.component';

interface Position {
  x: number;
  y: number;
}

interface GameState {
  catPosition: Position;
  catDirection: 'north' | 'south' | 'east' | 'west';
  applePositions: Position[];
  trapPositions: Position[];
  wallPositions: Position[];
  isGameOver: boolean;
  hasWon: boolean;
  applesCollected: number;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gridSize = 8;
  private minApples = 2;
  private maxApples = 4;
  private minTraps = 3;
  private maxTraps = 5;
  private minWalls = 4;
  private maxWalls = 8;
  
  private gameState = new BehaviorSubject<GameState>(this.generateNewMap());
  gameState$ = this.gameState.asObservable();

  private generateNewMap(): GameState {
    let state: GameState;
    do {
      state = this.attemptMapGeneration();
    } while (!this.validateMap(state));
    
    return state;
  }

  private attemptMapGeneration(): GameState {
    const catPosition = { x: 0, y: 0 };
    const appleCount = Math.floor(Math.random() * (this.maxApples - this.minApples + 1)) + this.minApples;
    const trapCount = Math.floor(Math.random() * (this.maxTraps - this.minTraps + 1)) + this.minTraps;
    const wallCount = Math.floor(Math.random() * (this.maxWalls - this.minWalls + 1)) + this.minWalls;

    const applePositions: Position[] = [];
    const trapPositions: Position[] = [];
    const wallPositions: Position[] = [];

    // Generate apples
    for (let i = 0; i < appleCount; i++) {
      let position;
      do {
        position = this.getRandomPosition();
      } while (
        this.positionOverlaps(position, [catPosition], applePositions, trapPositions, wallPositions)
      );
      applePositions.push(position);
    }

    // Generate traps
    for (let i = 0; i < trapCount; i++) {
      let position;
      do {
        position = this.getRandomPosition();
      } while (
        this.positionOverlaps(position, [catPosition], applePositions, trapPositions, wallPositions)
      );
      trapPositions.push(position);
    }

    // Generate walls
    for (let i = 0; i < wallCount; i++) {
      let position;
      do {
        position = this.getRandomPosition();
      } while (
        this.positionOverlaps(position, [catPosition], applePositions, trapPositions, wallPositions)
      );
      wallPositions.push(position);
    }

    return {
      catPosition,
      catDirection: 'east',
      applePositions,
      trapPositions,
      wallPositions,
      isGameOver: false,
      hasWon: false,
      applesCollected: 0
    };
  }

  private validateMap(state: GameState): boolean {
    // Check if at least one apple is reachable
    return state.applePositions.some(apple => 
      this.isPathPossible(state.catPosition, apple, state.wallPositions));
  }

  private isPathPossible(start: Position, end: Position, walls: Position[]): boolean {
    const queue: Position[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (current.x === end.x && current.y === end.y) {
        return true;
      }

      const moves = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const move of moves) {
        if (
          this.isValidPosition(move) && 
          !walls.some(w => w.x === move.x && w.y === move.y) &&
          !visited.has(`${move.x},${move.y}`)
        ) {
          queue.push(move);
          visited.add(`${move.x},${move.y}`);
        }
      }
    }

    return false;
  }

  private getRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * this.gridSize),
      y: Math.floor(Math.random() * this.gridSize)
    };
  }

  private positionOverlaps(pos: Position, ...positionArrays: Position[][]): boolean {
    return positionArrays.some(positions =>
      positions.some(p => p.x === pos.x && p.y === pos.y)
    );
  }

  private resetCatPosition(state: GameState): GameState {
    return {
      ...state,
      catPosition: { x: 0, y: 0 },
      catDirection: 'east',
      applesCollected: 0,
      isGameOver: false,
      hasWon: false
    };
  }

  async executeInstructions(instructions: Instruction[]) {
    let currentState = this.resetCatPosition(this.gameState.value);
    this.gameState.next(currentState);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const instruction of instructions) {
      if (currentState.isGameOver) break;

      switch (instruction) {
        case 'turnLeft':
          currentState.catDirection = this.getTurnDirection(currentState.catDirection, 'left');
          break;
        case 'turnRight':
          currentState.catDirection = this.getTurnDirection(currentState.catDirection, 'right');
          break;
        case 'moveForward':
          const newPosition = this.calculateNewPosition(currentState);
          if (this.isValidPosition(newPosition) && 
              !currentState.wallPositions.some(w => w.x === newPosition.x && w.y === newPosition.y)) {
            currentState.catPosition = newPosition;
            this.checkGameStatus(currentState);
          }
          break;
      }

      this.gameState.next({...currentState});
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  private getTurnDirection(currentDirection: string, turn: 'left' | 'right'): 'north' | 'south' | 'east' | 'west' {
    const directions = ['north', 'east', 'south', 'west'];
    const currentIndex = directions.indexOf(currentDirection);
    
    if (turn === 'left') {
      return directions[(currentIndex + 3) % 4] as 'north' | 'south' | 'east' | 'west';
    } else {
      return directions[(currentIndex + 1) % 4] as 'north' | 'south' | 'east' | 'west';
    }
  }

  private calculateNewPosition(state: GameState): Position {
    const { x, y } = state.catPosition;
    
    switch (state.catDirection) {
      case 'north':
        return { x, y: y - 1 };
      case 'south':
        return { x, y: y + 1 };
      case 'east':
        return { x: x + 1, y };
      case 'west':
        return { x: x - 1, y };
    }
  }

  private isValidPosition(position: Position): boolean {
    return position.x >= 0 && position.x < this.gridSize &&
           position.y >= 0 && position.y < this.gridSize;
  }

  private checkGameStatus(state: GameState) {
    // Check if cat hit a trap
    if (state.trapPositions.some(trap => 
        trap.x === state.catPosition.x && trap.y === state.catPosition.y)) {
      state.isGameOver = true;
      return;
    }

    // Check if cat collected an apple
    const appleIndex = state.applePositions.findIndex(apple => 
      apple.x === state.catPosition.x && apple.y === state.catPosition.y);
    
    if (appleIndex !== -1) {
      state.applePositions.splice(appleIndex, 1);
      state.applesCollected++;
      
      // Win condition: all apples collected
      if (state.applePositions.length === 0) {
        state.hasWon = true;
        state.isGameOver = true;
      }
    }
  }

  resetGame() {
    this.gameState.next(this.generateNewMap());
  }
}