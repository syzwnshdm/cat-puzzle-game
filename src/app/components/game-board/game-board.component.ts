import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { InstructionService } from '../../services/instruction.service';
import { Subscription } from 'rxjs';
import confetti from 'canvas-confetti';

interface Position {
  x: number;
  y: number;
}

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-board.component.html',
  styleUrl: './game-board.component.scss'
})
export class GameBoardComponent implements OnInit, OnDestroy {
  protected readonly Math = Math;
  private subscription: Subscription | undefined;

  gridSize = 8;
  catPosition = { x: 0, y: 0 };
  applePositions: Position[] = [];
  trapPositions: Position[] = [];
  wallPositions: Position[] = [];
  catDirection: 'north' | 'south' | 'east' | 'west' = 'east';
  isGameOver = false;
  hasWon = false;
  applesCollected = 0;

  constructor(
    private gameService: GameService,
    private instructionService: InstructionService
  ) {}

  ngOnInit() {
    this.subscription = this.gameService.gameState$.subscribe(state => {
      this.catPosition = state.catPosition;
      this.catDirection = state.catDirection;
      this.applePositions = state.applePositions;
      this.trapPositions = state.trapPositions;
      this.wallPositions = state.wallPositions;
      this.isGameOver = state.isGameOver;
      this.hasWon = state.hasWon;
      this.applesCollected = state.applesCollected;

      if (state.hasWon) {
        this.triggerConfetti();
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  
  restartGame() {
    this.gameService.resetGame();
    this.instructionService.clearInstructions();
  }

  getGrid(): number[] {
    return Array(this.gridSize * this.gridSize).fill(0);
  }

  isTrap(x: number, y: number): boolean {
    return this.trapPositions.some(pos => pos.x === x && pos.y === y);
  }

  isWall(x: number, y: number): boolean {
    return this.wallPositions.some(pos => pos.x === x && pos.y === y);
  }

  isCat(x: number, y: number): boolean {
    return this.catPosition.x === x && this.catPosition.y === y;
  }

  isApple(x: number, y: number): boolean {
    return this.applePositions.some(pos => pos.x === x && pos.y === y);
  }

  private triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}