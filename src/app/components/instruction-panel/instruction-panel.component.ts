import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Instruction } from '../puzzle-pieces/puzzle-pieces.component';
import { GameService } from '../../services/game.service';
import { Subscription } from 'rxjs';
import { InstructionService } from '../../services/instruction.service';

@Component({
  selector: 'app-instruction-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instruction-panel.component.html',
  styleUrl: './instruction-panel.component.scss'
})
export class InstructionPanelComponent implements OnInit, OnDestroy {
  instructions: Instruction[] = [];
  private subscription: Subscription;

  constructor(
    private gameService: GameService,
    private instructionService: InstructionService
  ) {
    this.subscription = this.instructionService.instructionAdded$.subscribe(
      instruction => this.instructions.push(instruction)
    );
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const instruction = event.dataTransfer?.getData('instruction') as Instruction;
    if (instruction) {
      this.instructions.push(instruction);
    }
  }

  executeInstructions() {
    this.gameService.executeInstructions(this.instructions);
  }

  clearInstructions() {
    this.instructions = [];
    this.gameService.resetGame();
  }

  removeInstruction(index: number) {
    this.instructions.splice(index, 1);
  }
}