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
  applePosition: Position;
  wormPositions: Position[];
  isGameOver: boolean;
  hasWon: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gridSize = 8;
  
  private initialState: GameState = {
    catPosition: { x: 0, y: 0 },
    catDirection: 'east', // Start facing east
    applePosition: { x: 7, y: 7 },
    wormPositions: [
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 3 }
    ],
    isGameOver: false,
    hasWon: false
  };

  private gameState = new BehaviorSubject<GameState>({...this.initialState});
  gameState$ = this.gameState.asObservable();

  async executeInstructions(instructions: Instruction[]) {
    this.resetGame();
    await new Promise(resolve => setTimeout(resolve, 500));
    let currentState = {...this.gameState.value};
    
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
          if (this.isValidPosition(newPosition)) {
            currentState.catPosition = newPosition;
            this.checkGameStatus(currentState);
          } else {
            currentState.isGameOver = true;
          }
          break;
      }

      // Update state after each instruction
      this.gameState.next({...currentState});
      
      // Add a small delay between instructions
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
    // Check if cat reached apple
    if (state.catPosition.x === state.applePosition.x && 
        state.catPosition.y === state.applePosition.y) {
      state.hasWon = true;
      state.isGameOver = true;
    }

    // Check if cat hit a worm
    if (state.wormPositions.some(worm => 
        worm.x === state.catPosition.x && worm.y === state.catPosition.y)) {
      state.isGameOver = true;
    }
  }

  resetGame() {
    this.gameState.next({...this.initialState});
  }
}