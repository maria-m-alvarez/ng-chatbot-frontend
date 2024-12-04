import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAuthLoginComponent } from './page-auth-login.component';

describe('PageAuthLoginComponent', () => {
  let component: PageAuthLoginComponent;
  let fixture: ComponentFixture<PageAuthLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAuthLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
