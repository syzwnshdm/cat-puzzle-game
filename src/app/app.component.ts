import { Component } from '@angular/core';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { InstructionPanelComponent } from './components/instruction-panel/instruction-panel.component';
import { PuzzlePiecesComponent } from './components/puzzle-pieces/puzzle-pieces.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    GameBoardComponent,
    InstructionPanelComponent, 
    PuzzlePiecesComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cat-puzzle-game';
}