import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonForToggleablesComponent } from './button-for-toggleables.component';

describe('ButtonForToggleablesComponent', () => {
  let component: ButtonForToggleablesComponent;
  let fixture: ComponentFixture<ButtonForToggleablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonForToggleablesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonForToggleablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
