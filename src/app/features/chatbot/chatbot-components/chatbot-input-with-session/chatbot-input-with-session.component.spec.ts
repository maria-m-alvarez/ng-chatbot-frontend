import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotInputWithSessionComponent } from './chatbot-input-with-session.component';

describe('ChatbotInputWithSessionComponent', () => {
  let component: ChatbotInputWithSessionComponent;
  let fixture: ComponentFixture<ChatbotInputWithSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotInputWithSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotInputWithSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
