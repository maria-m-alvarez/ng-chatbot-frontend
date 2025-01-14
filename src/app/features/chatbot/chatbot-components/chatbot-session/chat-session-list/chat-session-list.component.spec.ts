import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionListComponent } from './chat-session-list.component';

describe('ChatSessionListComponent', () => {
  let component: ChatSessionListComponent;
  let fixture: ComponentFixture<ChatSessionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
