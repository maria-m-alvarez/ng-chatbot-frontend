import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatbotBrainService } from '../../chatbot-services/chatbot-brain/chatbot-brain.service';
import { ChatbotBaseComponentComponent } from '../chatbot-base-component/chatbot-base-component.component';
import { ChatbotModelSelectorComponent } from "../chatbot-model-selector/chatbot-model-selector.component";
import { InputBooleanSelectorComponent } from '../../../../core/components/input-components/input-boolean-selector/input-boolean-selector.component';
import { InputSelectorComponent } from '../../../../core/components/input-components/input-selector/input-selector.component';
import { ModalFullscreenComponent } from '../../../../lib/components/modal/modal-fullscreen/modal-fullscreen.component';
import { ToggleService } from '../../../../lib/toggleable/toggleable.service';

@Component({
  selector: 'app-chatbot-settings',
  standalone: true,
  templateUrl: './chatbot-settings.component.html',
  styleUrls: ['./chatbot-settings.component.scss'],
  imports: [ModalFullscreenComponent, InputSelectorComponent, ChatbotModelSelectorComponent, InputBooleanSelectorComponent]
})
export class ChatbotSettingsComponent extends ChatbotBaseComponentComponent {
  @ViewChild('ollamaModelNameInput') ollamaModelNameInput: ElementRef<HTMLInputElement> | undefined;

  providerOptions = this.brain.chatbotSessionService.getProviderSelectorOptions();
  modelOptions = this.brain.chatbotSessionService.getProviderModelSelectorOptions(
    this.brain.chatbotSettings.provider
  );

  collectionCount: string = '0';

  optionStates = {
    options: 'options',
    systemPrompt: 'system-prompt',
  }

  optionsState: string = this.optionStates.options;

  constructor(
    brain: ChatbotBrainService,
    toggleService: ToggleService
  ) {
    super(brain);

    brain.chatbotEventService.tempEvent_OnChromaDBCount.subscribe((count) => {
      this.collectionCount = count;
    });
  }

  toggleOptionsState(state: string): void {
    this.optionsState = state;
  }

  // Handle changes to the prompt settings
  onSeedChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.seed = Number(input.value);
  }

  onTopKChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.top_k = Number(input.value);
  }

  onTopPChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.top_p = Number(input.value);
  }

  onTemperatureChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.temperature = Number(input.value);
  }

  onRepeatPenaltyChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.repeat_penalty = Number(input.value);
  }

  onStopTokensChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    ChatbotBrainService.chatbotSettings.options.stop = input.value.split(',').map(token => token.trim());
  }

  // Handle the system-prompt input
  onPrePromptChange(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    ChatbotBrainService.chatbotSettings.systemPrompt = input.value;
  }

  onInputChanged(inputID: string, value: any): void {
    if (inputID === 'chatbot_provider') {
      this.onProviderChanged(value);
    }

    if (inputID === 'chatbot_model') {
      this.onModelChanged(value);
    }

    if (inputID === 'chatbot_use_options') {
      this.brain.updateChatbotUseOptions(value as boolean);
    }

    if (inputID === 'chatbot_stream') {
      this.brain.updateChatbotStream(value as boolean);
    }

    console.log('Input changed:', inputID, value);
    console.log('Configs:', ChatbotBrainService.chatbotSettings);
  }

  onProviderChanged(newProvider: string): void {
    this.brain.updateChatbotProvider(newProvider);
    this.modelOptions = this.brain.chatbotSessionService.getProviderModelSelectorOptions(newProvider);
  }

  onModelChanged(newModel: string): void {
    this.brain.updateChatbotModel(newModel);
  }

  click_tempChromaDbIngestion() {
    console.log('Ingesting Chroma DB');

    this.collectionCount = "0";
    this.brain.chatbotApiService.vectorDbIngestion().subscribe({
      next: (response) => {
        console.log('Vector DB Ingestion:', response);
        this.click_tempCollectionCount();
      },
      error: (error) => {
        console.error('Error ingesting Vector DB:', error);
      }
    });
  }

  click_tempChromaDbDeletion() {
    console.log('Deleting Chroma DB');
    this.brain.chatbotApiService.vectorDbDeletion().subscribe({
      next: (response) => {
        this.collectionCount = "0";
        console.log('Vector DB Deletion:', response);
      },
      error: (error) => {
        console.error('Error deleting Vector DB:', error);
      }
    });
  }

  click_tempCollectionCount() {
    console.log('Getting Chroma DB Count');
    
    this.brain.chatbotApiService.vectorDbCount().subscribe({
      next: (response) => {
        console.log('Vector DB Count:', response);
        this.collectionCount = response.message;
      },
      error: (error) => {
        console.error('Error retrieving Vector DB count:', error);
        this.collectionCount = 'Error';
      }
    });
  }  
}
