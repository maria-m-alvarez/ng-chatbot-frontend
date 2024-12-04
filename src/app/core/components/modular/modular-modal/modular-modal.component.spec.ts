import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModularModalComponent } from './modular-modal.component';

describe('ModularModalComponent', () => {
  let component: ModularModalComponent;
  let fixture: ComponentFixture<ModularModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModularModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModularModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
