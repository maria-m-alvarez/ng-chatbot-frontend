import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModularHeaderComponent } from '../minsait-header/minsait-header.component';

describe('ModularHeaderComponent', () => {
  let component: ModularHeaderComponent;
  let fixture: ComponentFixture<ModularHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModularHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModularHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
