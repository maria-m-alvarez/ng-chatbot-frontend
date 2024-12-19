import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoMinsaitMagiaComponent } from './logo-minsait-magia.component';

describe('LogoMinsaitMagiaComponent', () => {
  let component: LogoMinsaitMagiaComponent;
  let fixture: ComponentFixture<LogoMinsaitMagiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoMinsaitMagiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoMinsaitMagiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
