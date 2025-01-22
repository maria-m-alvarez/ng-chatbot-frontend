
export enum Role {
    Assistant = 'assistant',
    User = 'user'
}

export enum ChatSessionState {
    NoSession,          // when user logs in & sees the chatbot for the first time
    NewSession,         // when user starts a new chatbot session
    ActiveSession,      // when user is in the chatbot session
    Transition
}

export enum ChatSessionInteractionState {
    Idle,
    Typing,
    Loading,
    Dragging,
    Error
}

export enum ChatbotInputStates {
    Idle,
    Waiting,
    Dragging,
    Error, 
  };