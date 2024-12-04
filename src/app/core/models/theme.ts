export class Theme {
  // Main Colors
  mainPrimary: string = '#480E2A';
  mainPrimaryContrast: string = '#260717';
  mainSecondary: string = '#E3E2DA';
  mainSecondaryContrast: string = '#FF0054';
  mainTerciary: string = '#FFFFFF';
  mainTerciaryContrast: string = '#FF0054';
  mainHighlight: string = '#FF0054';

  // Background Colors
  backgroundPrimary: string = '#480E2A';
  backgroundSecondary: string = '#E3E2DA';
  backgroundTerciary: string = '#FFFFFF';
  backgroundHighlight: string = '#260717';

  // Text Colors
  textPrimary: string = '#260717';
  textSecondary: string = '#E3E2DA';
  textTertiary: string = '#FFFFFF';
  textHighlight: string = '#FF0054';

  // Border Colors
  borderPrimary: string = '#260717';
  borderSecondary: string = '#E3E2DA';
  borderTerciary: string = '#FFFFFF';
  borderHighlight: string = '#FF0054';

  // Chatbot Colors
  chatbotBackground: string = '#FFFFFF';
  chatbotBubbleUserBackground: string = '#480E2A';
  chatbotBubbleUserText: string = '#E3E2DA';
  chatbotBubbleAssistantBackground: string = '#260717';
  chatbotBubbleAssistantText: string = '#E3E2DA';

  // Semantic Colors
  success: string = '#4ACB90';
  successSecondary: string = '#EAF7F0';
  error: string = '#F93F3E';
  errorSecondary: string = '#FBE8E8';
  warning: string = '#FCA12F';
  warningSecondary: string = '#FAF2E8';
  info: string = '#60AFFE';
  infoSecondary: string = '#ECF3FB';
  help: string = '#9011FE';
  helpSecondary: string = '#F0E3FC';
  focus: string = '#0D5BA6';
  focusSecondary: string = '#E4EAF2';

  // Scrollbar Colors
  scrollbarTrack: string = '#FFFFFF';
  scrollbarThumb: string = '#E3E2DA';
  scrollbarThumbHover: string = '#480E2A';

  constructor(values: Partial<Theme> = {}) {
    Object.assign(this, values);
  }
}
