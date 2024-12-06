import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionMessageVoteComponent } from '../chatbot-prompt-vote/chatbot-prompt-vote.component';

describe('ChatSessionMessageVoteComponent', () => {
  let component: ChatSessionMessageVoteComponent;
  let fixture: ComponentFixture<ChatSessionMessageVoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionMessageVoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionMessageVoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
