import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionHistoryComponent } from '../chatbot-session-history/chatbot-session-history.component';

describe('ChatSessionHistoryComponent', () => {
  let component: ChatSessionHistoryComponent;
  let fixture: ComponentFixture<ChatSessionHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
