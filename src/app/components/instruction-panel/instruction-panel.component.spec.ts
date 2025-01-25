import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionPanelComponent } from './instruction-panel.component';

describe('InstructionPanelComponent', () => {
  let component: InstructionPanelComponent;
  let fixture: ComponentFixture<InstructionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructionPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
