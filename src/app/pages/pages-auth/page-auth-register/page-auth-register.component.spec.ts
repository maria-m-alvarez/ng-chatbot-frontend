import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAuthRegisterComponent } from './page-auth-register.component';

describe('PageAuthRegisterComponent', () => {
  let component: PageAuthRegisterComponent;
  let fixture: ComponentFixture<PageAuthRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageAuthRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
