# HTML Input:

```HTML
<!-- Input Field -->
<div class="flex-grow mx-2">
  <textarea #chatTextInput
    class="w-full max-h-32 resize-none bg-transparent px-3 py-2 outline-none"
    placeholder="{{ LocalizationKeys.SESSION_INPUT_PLACEHOLDER| translate }}"
    rows="1"
    id="chat-input"
    (input)="adjustTextareaHeight($event)" (keydown)="handleKeyDown($event)"></textarea>
</div>
```

# Typescript event listener:

```Typescript
adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
    this.inputText = textarea.value;
  }
```