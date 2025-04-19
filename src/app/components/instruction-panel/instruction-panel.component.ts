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
  currentInstructionIndex: number = -1;
  private subscription: Subscription;
  private isOverContainer: boolean = false;

  constructor(
    private gameService: GameService,
    private instructionService: InstructionService
  ) {
    this.subscription = new Subscription();
    this.subscription.add(
      this.instructionService.instructionAdded$.subscribe(
        instruction => this.instructions.push(instruction)
      )
    );
    this.subscription.add(
      this.instructionService.instructionsCleared$.subscribe(
        () => this.instructions = []
      )
    );
    this.subscription.add(
      this.gameService.gameState$.subscribe(state => {
        this.currentInstructionIndex = state.currentInstructionIndex;
      })
    );
  }

  ngOnInit() {}

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

  onContainerDragOver(event: DragEvent) {
    event.preventDefault();
    this.isOverContainer = true;
  }

  onContainerDragLeave(event: DragEvent) {
    this.isOverContainer = false;
  }

  onInstructionDragStart(event: DragEvent, index: number) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('instruction', this.instructions[index]);
    }
  }

  onInstructionDragEnd(event: DragEvent, index: number) {
    if (!this.isOverContainer) {
      this.removeInstruction(index);
    }
    this.isOverContainer = false;
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