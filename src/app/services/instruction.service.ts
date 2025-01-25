import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Instruction } from '../components/puzzle-pieces/puzzle-pieces.component';

@Injectable({
  providedIn: 'root'
})
export class InstructionService {

  constructor() { }

  private instructionAddedSource = new Subject<Instruction>();
  instructionAdded$ = this.instructionAddedSource.asObservable();

  addInstruction(instruction: Instruction) {
    this.instructionAddedSource.next(instruction);
  } 
}