import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionMessageAssistantComponent } from '../chatbot-prompt-answer/chatbot-prompt-answer.component';

describe('ChatSessionMessageAssistantComponent', () => {
  let component: ChatSessionMessageAssistantComponent;
  let fixture: ComponentFixture<ChatSessionMessageAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionMessageAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionMessageAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
