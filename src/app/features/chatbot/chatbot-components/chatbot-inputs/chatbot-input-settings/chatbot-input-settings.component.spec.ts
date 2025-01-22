import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotInputSettingsComponent } from './chatbot-input-settings.component';

describe('ChatbotInputSettingsComponent', () => {
  let component: ChatbotInputSettingsComponent;
  let fixture: ComponentFixture<ChatbotInputSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotInputSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotInputSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
