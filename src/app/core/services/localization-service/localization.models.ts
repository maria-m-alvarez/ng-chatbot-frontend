export interface Language {
    code: string;
    name: string;
  }
  
  // Defines only the translation structure
  export interface TranslationEntries {
    [key: string]: { [lang: string]: string };
  }
  
  // Full localization structure supporting multiple languages
  export interface Translations {
    languages: Language[]; // Store multiple languages
    entries: TranslationEntries;
  }
  
  // Enum to prevent hardcoded strings when referencing translation keys
  export enum LocalizationKeys {
    // common keys
    YES = "yes",
    NO = "no",
    CANCEL = "cancel",
    SAVE = "save",
    DELETE = "delete",
    EDIT = "edit",
    ADD = "add",
    CLOSE = "close",
    SEARCH = "search",
    LOADING = "loading",
    ERROR = "error",
    WARNING = "warning",
    INFO = "info",
    CONFIRM = "confirm",
    CONFIRM_DELETE = "confirmDelete",
    CONFIRM_CANCEL = "confirmCancel",
    CLEAR = "clear",
    PROFILE = "profile",
    SETTINGS = "settings",
    OPTIONS = "options",
    THEME = "theme",
    LANGUAGE = "language",
    LOGOUT = "logout",
    LOGIN = "login",
    INSERT_EMAIL = "insertEmail",
    INSERT_PASSWORD = "insertPassword",
    INVALID_EMAIL = "invalidEmail",
    INVALID_PASSWORD = "invalidPassword",
    FORGOT_PASSWORD = "forgotPassword",
    NO_ACCOUNT = "noAccount",
  
    // Session & Input
    SESSION_WELCOME_MAGIA = "sessionWelcomeMagia",
    SESSION_WELCOME = "sessionWelcome",
    SESSION_INPUT_PLACEHOLDER = "sessionInputPlaceholder",
    NEW_SESSION = "newSession",
    NEW_DOC_SESSION = "newDocSession",
    INSERT_SESSION_NAME = "insertSessionName",
    SESSION_NAME = "sessionName",
    SESSION_NAME_REQUIRED = "requiredSessionName",
    SESSION_UPLOAD_FILES = "sessionUploadFiles",
    SESSION_CREATE = "sessionCreate",
    SESSION_DOC_CREATE_TITLE = "sessionDocumentCreateTitle",
    REFERENCES = "references",
    AI_MESSAGE = "aiMessage",
    AI_MODEL = "aiModel",
    
    // Session & Input
    PROMPT = "prompt",
    SYSTEM_PROMPT = "systemPrompt",
    SYSTEM = "system",
    RESPONSE = "response",
    PROVIDER = "provider",
    MODEL = "model",
    MODEL_CONFIG = "modelConfig",
    STREAM = "stream",
    SEED = "seed",
    TEMPERATURE = "temperature",
    REPETITION_PENALTY = "repetitionPenalty",
    MAX_TOKENS = "maxTokens",
    STOP_TOKENS = "stopTokens",
    STOP_TOKENS_INPUT_PLACEHOLDER = "stopTokensInputPlaceholder",
    INGESTION = "ingestion",
    DIMENSION = "dimension",
    DROP_ZONE_MESSAGE = "dropZoneMessage",
  }
  
  
  