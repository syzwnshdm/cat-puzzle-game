import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, CdkDrag, CdkDropList, copyArrayItem, CdkDragStart, CdkDragEnd, CDK_DRAG_CONFIG } from '@angular/cdk/drag-drop';
import { InstructionService } from '../../services/instruction.service';

export type Instruction = 'turnLeft' | 'turnRight' | 'moveForward';

@Component({
  selector: 'app-puzzle-pieces',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './puzzle-pieces.component.html',
  styleUrl: './puzzle-pieces.component.scss',
  providers: [
    {
      provide: CDK_DRAG_CONFIG,
      useValue: {
        dragStartThreshold: 0,
        pointerDirectionChangeThreshold: 5,
        zIndex: 1000
      }
    }
  ]
})
export class PuzzlePiecesComponent {
  instructions: Instruction[] = ['turnLeft', 'turnRight', 'moveForward'];
  
  constructor(private instructionService: InstructionService) {}

  onDragStart(event: CdkDragStart) {
    const dragRef = event.source.element.nativeElement;
    dragRef.style.visibility = 'visible';
  }

  onDragEnd(event: CdkDragEnd) {
    const dragRef = event.source.element.nativeElement;
    dragRef.style.visibility = 'visible';
  }

  onDoubleClick(instruction: Instruction) {
    this.instructionService.addInstruction(instruction);
  }

  private getInstructionIcon(instruction: Instruction): string {
    switch(instruction) {
      case 'turnLeft': return '↰';
      case 'turnRight': return '↱';
      case 'moveForward': return '🚶';
    }
  }
}