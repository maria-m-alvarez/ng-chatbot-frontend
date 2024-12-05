import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatbotEventService } from '../chatbot-events/chatbot-event.service';
import { ProviderModelsResponse, ChatRequestOptions, ChatCompletion, ChatRequest } from '../../chatbot-models/chatbot-models';

@Injectable({
  providedIn: 'root',
})
export class ChatbotApiService {
  private readonly baseUrl = 'http://127.0.0.1:8000/chatbot';
  private webSocket: WebSocket | null = null;
  private webSocketSubject: Subject<string> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly chatbotEventService: ChatbotEventService
  ) {}

  // ------------------------------
  // API Methods
  // ------------------------------

  /**
   * Fetch all LLM providers.
   */
  getAllProviders(): Observable<string[]> {
    const url = `${this.baseUrl}/providers`;
    return this.http.get<string[]>(url);
  }

  /**
   * Fetch available models for a provider.
   * @param providerName - The name of the LLM provider.
   */
  getAllModelsByProvider(providerName: string): Observable<ProviderModelsResponse> {
    const url = `${this.baseUrl}/provider/models?provider_name=${providerName}`;
    return this.http.get<ProviderModelsResponse>(url);
  }

  /**
   * Send a chat prompt and receive a response.
   * @param provider - The LLM provider.
   * @param provider_model - The LLM model.
   * @param prompt - The user input prompt.
   * @param options - Chat generation options.
   */
  sendChatPrompt(provider: string, provider_model: string, prompt: string, options: ChatRequestOptions = {}): Observable<ChatCompletion> {
    const url = `${this.baseUrl}/chat`;
    const chatRequest: ChatRequest = {
      provider,
      provider_model,
      messages: [{ role: 'user', content: prompt }],
      options,
    };

    return this.http.post<ChatCompletion>(url, chatRequest);
  }

  /**
   * Send feedback for a specific chat prompt answer.
   * @param promptAnswerId - ID of the chat prompt answer.
   * @param voteType - Feedback type ("upvote" or "downvote").
   */
  sendPromptFeedback(promptAnswerId: number, voteType: string): Observable<any> {
    const url = `${this.baseUrl}/feedback`;
    const requestBody = { prompt_answer_id: promptAnswerId, vote_type: voteType };
    return this.http.post<any>(url, requestBody);
  }

  // ------------------------------
  // WebSocket Management
  // ------------------------------

  private createWebSocket(webSocketUrl: string): Subject<string> {
    if (this.webSocket) {
      return this.webSocketSubject!;
    }

    this.webSocket = new WebSocket(webSocketUrl);
    this.webSocketSubject = new Subject<string>();

    this.webSocket.onopen = () => console.log('WebSocket connection opened');
    this.webSocket.onmessage = (event) => this.webSocketSubject!.next(event.data);
    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.webSocketSubject!.complete();
      this.webSocket = null;
    };
    this.webSocket.onerror = (error) => console.error('WebSocket error:', error);

    return this.webSocketSubject!;
  }

  /**
   * Send a chat prompt using WebSocket.
   * @param webSocketUrl - The WebSocket URL.
   * @param prompt - The chat prompt.
   * @param modelName - The LLM model name.
   */
  sendChatPromptViaWebSocket(webSocketUrl: string, prompt: string, modelName: string): Observable<string> {
    const webSocketSubject = this.createWebSocket(webSocketUrl);

    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const requestBody = JSON.stringify({ prompt, model_name: modelName });
      this.webSocket.send(requestBody);
    }

    return webSocketSubject.asObservable();
  }

  /**
   * Close the WebSocket connection.
   */
  closeWebSocket(): void {
    if (this.webSocket) {
      this.webSocket.close();
      this.webSocket = null;
      this.webSocketSubject = null;
    }
  }

  

  // ------------------------------
  // Temporary Methods
  // ------------------------------

  /**
   * Temporary method for Chroma DB ingestion.
   */
  tempChromaDbIngestion(): Observable<any> {
    const url = `${this.baseUrl}/temp/chroma/ingest`;
    return this.http.get(url).pipe(map((response) => console.log('Chroma DB Ingestion:', response)));
  }

  /**
   * Temporary method for Chroma DB deletion.
   */
  tempChromaDbDeletion(): Observable<any> {
    const url = `${this.baseUrl}/temp/chroma/delete`;
    return this.http.get(url).pipe(map((response) => console.log('Chroma DB Deletion:', response)));
  }

  tempChromaDbCount(): void {
    const tempChromaBbCountURL = "http://127.0.0.1:8000/chatbot/temp/chroma/count";
    const request = this.http.get<{message:string, count:number}>(tempChromaBbCountURL);
    request.subscribe({
      next: (response) => {
        console.log('Chroma BB Injestion Response:', response);
        this.chatbotEventService.tempEvent_OnChromaDBCount.emit(response?.count);
      },
      error: (error) => {
        console.error('Error from Chroma BB Injestion:', error);
      },
      complete: () => {
        console.log('Chroma BB Injestion Complete');
      }
    });
  }
}
