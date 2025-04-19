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
  private draggedIndex: number = -1;
  private insertIndex: number = -1;

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
    const target = event.target as HTMLElement;
    const instructionElement = target.closest('.instruction') as HTMLElement;
    
    if (instructionElement) {
      const rect = instructionElement.getBoundingClientRect();
      const isAfter = event.clientX - rect.left > rect.width / 2;
      this.insertIndex = parseInt(instructionElement.getAttribute('data-index') || '-1');
      if (isAfter) this.insertIndex++;

      // Reset all instruction elements
      document.querySelectorAll('.instruction').forEach(el => {
        const element = el as HTMLElement;
        element.style.borderRight = '';
        element.style.borderLeft = '';
      });

      // Show insertion indicator
      if (isAfter) {
        instructionElement.style.borderRight = '3px solid #4caf50';
      } else {
        instructionElement.style.borderLeft = '3px solid #4caf50';
      }
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const instruction = event.dataTransfer?.getData('instruction') as Instruction;
    const sourceIndex = event.dataTransfer?.getData('sourceIndex');
    
    // Reset all instruction elements
    document.querySelectorAll('.instruction').forEach(el => {
      (el as HTMLElement).style.borderRight = '';
      (el as HTMLElement).style.borderLeft = '';
    });

    if (instruction) {
      if (sourceIndex) {
        // Moving an existing instruction
        const fromIndex = parseInt(sourceIndex);
        let toIndex = this.insertIndex;
        
        // Adjust index if moving forward in the array
        if (fromIndex < toIndex) {
          toIndex--;
        }
        
        if (toIndex >= 0 && fromIndex !== toIndex) {
          const [removed] = this.instructions.splice(fromIndex, 1);
          this.instructions.splice(toIndex, 0, removed);
        }
      } else {
        // Adding a new instruction
        if (this.insertIndex >= 0) {
          this.instructions.splice(this.insertIndex, 0, instruction);
        } else {
          this.instructions.push(instruction);
        }
      }
    }
    this.insertIndex = -1;
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
      event.dataTransfer.setData('sourceIndex', index.toString());
      this.draggedIndex = index;
    }
  }

  onInstructionDragEnd(event: DragEvent, index: number) {
    if (!this.isOverContainer) {
      this.removeInstruction(index);
    }
    this.isOverContainer = false;
    this.draggedIndex = -1;
    this.insertIndex = -1;
  }

  executeInstructions() {
    this.gameService.executeInstructions(this.instructions);
  }

  clearInstructions() {
    this.instructions = [];
    this.gameService.executeInstructions([]); // This will reset the cat position without generating a new map
  }

  removeInstruction(index: number) {
    this.instructions.splice(index, 1);
  }

  getInsertionClass(index: number): string {
    if (this.insertIndex === index) return 'insert-before';
    if (this.insertIndex === index + 1) return 'insert-after';
    return '';
  }
}