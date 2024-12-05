export class ChatbotSettings {
    provider: string;
    model: string;
    connectionName: string;
    stream: boolean;
    useOptions: boolean;
    options: ChatbotOptions;
    systemPrompt: string | null = null;
  
    public static readonly defaultOptions: ChatbotOptions = {
      seed: 0,
      top_k: 20,
      top_p: 0.9,
      temperature: 0.7,
      repeat_penalty: 1.2,
      stop: [],
    };
  
    constructor(
      provider: string,
      model: string,
      connectionName: string,
      stream: boolean,
      useOptions: boolean,
      options: ChatbotOptions
    ) {
      this.provider = provider;
      this.model = model;
      this.connectionName = connectionName;
      this.stream = stream;
      this.useOptions = useOptions;
      this.options = options;
    }
  }
  

export interface ChatbotOptions {
    seed: number;
    top_k: number;
    top_p: number;
    temperature: number;
    repeat_penalty: number;
    stop: string[];
}