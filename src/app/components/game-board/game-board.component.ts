import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';

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
  applePosition = { x: 7, y: 7 };
  wormPositions: Position[] = [];
  catDirection: 'north' | 'south' | 'east' | 'west' = 'east';
  isGameOver = false;
  hasWon = false;

  constructor(private gameService: GameService) {}

  ngOnInit() {
    this.subscription = this.gameService.gameState$.subscribe(state => {
      this.catPosition = state.catPosition;
      this.catDirection = state.catDirection;
      this.applePosition = state.applePosition;
      this.wormPositions = state.wormPositions;
      this.isGameOver = state.isGameOver;
      this.hasWon = state.hasWon;
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  
  getGrid(): number[] {
    return Array(this.gridSize * this.gridSize).fill(0);
  }

  isWorm(x: number, y: number): boolean {
    return this.wormPositions.some(pos => pos.x === x && pos.y === y);
  }

  isCat(x: number, y: number): boolean {
    return this.catPosition.x === x && this.catPosition.y === y;
  }

  isApple(x: number, y: number): boolean {
    return this.applePosition.x === x && this.applePosition.y === y;
  }
}