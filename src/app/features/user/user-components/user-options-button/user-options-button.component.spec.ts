import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOptionsButtonComponent } from './user-options-button.component';

describe('UserOptionsButtonComponent', () => {
  let component: UserOptionsButtonComponent;
  let fixture: ComponentFixture<UserOptionsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserOptionsButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserOptionsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
