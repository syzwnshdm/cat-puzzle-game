import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstructionService } from '../../services/instruction.service';

export type Instruction = 'turnLeft' | 'turnRight' | 'moveForward';

@Component({
  selector: 'app-puzzle-pieces',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './puzzle-pieces.component.html',
  styleUrl: './puzzle-pieces.component.scss'
})
export class PuzzlePiecesComponent {
  instructions: Instruction[] = ['turnLeft', 'turnRight', 'moveForward'];

  constructor(private instructionService: InstructionService) {}

  onDragStart(event: DragEvent, instruction: Instruction) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('instruction', instruction);
    }
  }

  onDoubleClick(instruction: Instruction) {
    this.instructionService.addInstruction(instruction);
  }
}