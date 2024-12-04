import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ChatbotSettings, ChatbotOptions } from '../../features/chatbot/chatbot-models/chatbot-settings';
import { SelectorOption } from '../components/input-components/input-selector/input-selector.component';
import { Theme } from '../models/theme';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;

  constructor(private readonly http: HttpClient) {}

  // Load the configuration JSON
  loadConfig(): Observable<any> {
    return this.http.get('/assets/config/chatbot.config.json').pipe(
      tap((config) => {
        this.config = config;
        console.log('Config loaded:', this.config);
      })
    );
  }

  getFromConfigJson<T>(path: string, fallback: T = undefined as any): T {
    if (!this.config) {
      console.error('Configuration not loaded.');
      return fallback;
    }
  
    try {
      const keys = path.split('.');
      let value = this.config;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined || value === null) {
          return fallback;
        }
      }
      return value as T;
    } catch (error) {
      console.error(`Error accessing config path "${path}":`, error);
      return fallback;
    }
  }

  getConfig(): any {
    return this.config;
  }

  formatConnectionName(connectionName: string): string {
    return connectionName.toLowerCase().replace(/[\s_]/g, '');
  }

  getTheme(mode: 'light' | 'dark' = 'light'): Theme {
    const themeConfig = this.getFromConfigJson(`themes.${mode}`, {});
    return new Theme(themeConfig);
  }

  // ----------------------------------------------
  // Organization
  // ----------------------------------------------
  get organizationLogoPos(): string {
    return this.getFromConfigJson<string>('organization.logoPos', '');
  }

  get organizationLogoNeg(): string {
    return this.getFromConfigJson<string>('organization.logoNeg', this.organizationLogoPos);
  }

  get organizationName(): string {
    return this.getFromConfigJson<string>('organization.name', '');
  }

  get organizationUrl(): string {
    return this.getFromConfigJson<string>('organization.url', '');
  }

  // ----------------------------------------------
  // API Settings
  // ----------------------------------------------
  get apiConnectionNames(): { connectionName: string; formattedConnectionName: string }[] {
    return this.getFromConfigJson<any[]>('apiSettings.connectionSettings.connections', []).map((connection: any) => ({
      connectionName: connection.name,
      formattedConnectionName: this.formatConnectionName(connection.name),
    }));
  }

  get apiConnectionOptions(): SelectorOption[] {
    return this.apiConnectionNames.map((connection, index) => new SelectorOption(index, connection.connectionName));
  }

  get apiConnectionName(): string {
    return this.getFromConfigJson<string>('apiSettings.connectionSettings.connectionName', '');
  }

  get activeApiConnection(): any {
    const connectionName = this.apiConnectionName;
    return this.getFromConfigJson<any[]>('apiSettings.connectionSettings.connections', []).find(
      (connection: any) => connection.name === connectionName
    );
  }

  getChatUrlByConnectionName(connectionName: string): string {
    const connection = this.getApiConnectionByName(connectionName);
    return connection?.chatURL ?? '';
  }

  getFeedbackUrlByConnectionName(connectionName: string): string {
    const connection = this.getApiConnectionByName(connectionName);
    return connection?.feedbackURL ?? '';
  }

  getModelsUrlByConnectionName(connectionName: string): string {
    const connection = this.getApiConnectionByName(connectionName);
    return connection?.availableModelsURL ?? '';
  }

  getApiConnectionByName(connectionName: string): any {
    const formattedConnectionName = this.formatConnectionName(connectionName || this.apiConnectionName || 'fastapi');
    return this.getFromConfigJson<any[]>('apiSettings.connectionSettings.connections', []).find(
      (connection: any) => this.formatConnectionName(connection.name) === formattedConnectionName
    );
  }

  updateConnectionName(connectionName: string): void {
    if (this.config?.apiSettings?.connectionSettings) {
      this.config.apiSettings.connectionSettings.connectionName = connectionName;
      console.log('Connection Name Updated:', connectionName);
    }
  }

  // ----------------------------------------------
  // Chatbot Settings
  // ----------------------------------------------
  get chatbotSettings(): ChatbotSettings {
    const settings = this.getFromConfigJson<any>('chatbotSettings', {});
    const options = settings.optionsLevel === 'simple' ? this.getSimpleChatbotOptions() : this.getCompleteChatbotOptions();
    return new ChatbotSettings(
      settings.model ?? 'defaultModel',
      settings.provider ?? 'defaultApiProvider',
      settings.stream ?? false,
      settings.useOptions ?? false,
      options
    );
  }

  getSimpleChatbotOptions(): ChatbotOptions {
    const options = this.getFromConfigJson<ChatbotOptions>('chatbotSettings.options', ChatbotSettings.simpleDefaultOptions);
    return {
      seed: options.seed ?? 0,
      top_k: options.top_k ?? 20,
      top_p: options.top_p ?? 0.9,
      temperature: options.temperature ?? 0.8,
      repeat_penalty: options.repeat_penalty ?? 1.2,
      stop: options.stop ?? [],
    };
  }

  getCompleteChatbotOptions(): ChatbotOptions {
    const options = this.getFromConfigJson<ChatbotOptions>('chatbotSettings.options', ChatbotSettings.completeDefaultOptions);
    return {
      ...this.getSimpleChatbotOptions(),
      num_keep: options.num_keep ?? null,
      num_predict: options.num_predict ?? null,
      // Add other fields as necessary
    };
  }

  get prePrompt(): string {
    return this.getFromConfigJson<string>('prePrompt', '');
  }

  // ----------------------------------------------
  // Layout Settings
  // ----------------------------------------------
  get allowCopyInChatbotPrompt(): boolean {
    return this.getFromConfigJson<boolean>('layout.chatbotPrompt.allowCopy', false);
  }

  get isFeedbackActive(): boolean {
    return this.getFromConfigJson<boolean>('layout.chatbotPromptAnswer.promptFeedback.active', false);
  }

  get feedbackStyle(): string {
    return this.getFromConfigJson<string>('layout.chatbotPromptAnswer.promptFeedback.style', 'rating');
  }

  get maxRating(): number {
    return this.getFromConfigJson<number>('layout.chatbotPromptAnswer.promptFeedback.maxRating', 5);
  }

  get isSidePanelActive(): boolean {
    return this.getFromConfigJson<boolean>('layout.sidePanel.active', true);
  }

  get sidePanelPosition(): string {
    return this.getFromConfigJson<string>('layout.sidePanel.position', 'left');
  }

  get sidePanelWidth(): string {
    return this.getFromConfigJson<string>('layout.sidePanel.width', '300px');
  }
}
