import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { GameService } from '../../services/game.service';
import { InstructionService } from '../../services/instruction.service';
import { Instruction } from '../puzzle-pieces/puzzle-pieces.component';

@Component({
  selector: 'app-instruction-panel',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './instruction-panel.component.html',
  styleUrl: './instruction-panel.component.scss'
})
export class InstructionPanelComponent implements OnInit, OnDestroy {
  instructions: Instruction[] = [];
  private subscription: Subscription;
  isDraggingNew = false;

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
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onDragEnter(event: DragEvent) {
    if (event.dataTransfer?.types.includes('instruction')) {
      this.isDraggingNew = true;
    }
  }

  onDragLeave(event: DragEvent) {
    this.isDraggingNew = false;
  }

  drop(event: CdkDragDrop<Instruction[]>) {
    if (event.previousContainer === event.container) {
      // Only allow reordering if not dragging new instruction
      if (!this.isDraggingNew) {
        moveItemInArray(this.instructions, event.previousIndex, event.currentIndex);
      }
    } else {
      // Insert the new instruction at the drop position
      if (event.currentIndex >= this.instructions.length) {
        // If dropping at the end, append
        this.instructions.push(event.item.data);
      } else {
        // Insert at the specific position
        this.instructions.splice(event.currentIndex, 0, event.item.data);
      }
    }
    this.isDraggingNew = false;
  }

  executeInstructions() {
    this.gameService.executeInstructions(this.instructions);
  }

  clearInstructions() {
    this.instructions = [];
    this.gameService.executeInstructions([]);
  }

  removeInstruction(index: number) {
    this.instructions.splice(index, 1);
  }
}