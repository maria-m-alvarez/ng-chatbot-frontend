import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAuthMainComponent } from './page-auth-main.component';

describe('PageAuthMainComponent', () => {
  let component: PageAuthMainComponent;
  let fixture: ComponentFixture<PageAuthMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAuthMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
