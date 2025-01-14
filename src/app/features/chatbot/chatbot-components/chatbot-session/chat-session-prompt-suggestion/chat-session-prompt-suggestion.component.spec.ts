import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionPromptSuggestionComponent } from './chat-session-prompt-suggestion.component';

describe('ChatSessionPromptSuggestionComponent', () => {
  let component: ChatSessionPromptSuggestionComponent;
  let fixture: ComponentFixture<ChatSessionPromptSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionPromptSuggestionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionPromptSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
