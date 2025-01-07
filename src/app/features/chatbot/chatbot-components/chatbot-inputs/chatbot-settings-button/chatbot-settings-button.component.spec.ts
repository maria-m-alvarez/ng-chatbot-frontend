import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotSettingsButtonComponent } from './chatbot-settings-button.component';

describe('ChatbotSettingsButtonComponent', () => {
  let component: ChatbotSettingsButtonComponent;
  let fixture: ComponentFixture<ChatbotSettingsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotSettingsButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotSettingsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
