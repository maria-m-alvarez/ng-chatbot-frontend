import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSessionMessageUserComponent } from '../chatbot-prompt/chatbot-prompt.component';

describe('ChatSessionMessageUserComponent', () => {
  let component: ChatSessionMessageUserComponent;
  let fixture: ComponentFixture<ChatSessionMessageUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSessionMessageUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatSessionMessageUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
