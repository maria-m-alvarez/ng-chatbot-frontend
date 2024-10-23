import { Component, Input, HostListener, ViewChild, ElementRef } from '@angular/core';
import { InputBaseComponent } from '../input-base/input-base.component';

export class SelectorOption {
  id: number;
  value: string;

  constructor(id: number, value: string) {
    this.id = id;
    this.value = value;
  }
}

@Component({
  selector: 'app-input-selector',
  standalone: true,
  templateUrl: './input-selector.component.html',
  styleUrls: ['./input-selector.component.scss']
})
export class InputSelectorComponent extends InputBaseComponent<SelectorOption> {
  @ViewChild('selector', { static: false }) selectorRef!: ElementRef;

  @Input() stringValue: string = '';
  @Input() defaultMessage: string = 'Select an option';
  @Input() options: SelectorOption[] = [];
  @Input() defaultSelectionID: number = -1;

  currentSelection: SelectorOption | null = null;
  isDropdownOpen = false;

  constructor() {
    super();
  }

  get valueAsString(): string {
    return this.currentSelection?.value ?? '';
  }

  ngOnInit() {
    this.refreshCurrentValue();
  }

  afterViewInit() {
    this.refreshCurrentValue();
  }

  refreshCurrentValue() {
    this.setDefaultSelection();
    this.setStringValueSelection();
  }

  setDefaultSelection() {
    if (this.defaultSelectionID !== -1) {
      const defaultSelection = this.options.find(option => option.id === this.defaultSelectionID);
      if (defaultSelection) {
        this.currentSelection = defaultSelection;
      }
    }
  }

  setValue() {
    if (this.value !== null && this.value !== undefined) {
      const selection = this.options.find(option =>
        option.value === this.value?.toString() || option.id === Number(this.value)
      );
      if (selection) {
        this.currentSelection = selection;
      }
    }
  }

  setStringValueSelection() {
    if (this.stringValue !== null && this.stringValue !== undefined) {
      const targetOption = this.options.find(option => option.value === this.stringValue);
      if (targetOption) {
        this.currentSelection = targetOption;
      }
    }
  }
  

  public toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  public selectOption(option: SelectorOption) {
    this.currentSelection = option;
    this.onValueChange.emit(option);
    this.isDropdownOpen = false;
  }

  public selectOptionByID(id: number) {
    const option = this.options.find(option => option.id === id);
    if (option) {
      this.selectOption(option);
    }
  }

  public getSelectionOptionsByValue(value: string): SelectorOption {
    return this.options.find(option => option.value === value) ?? this.options[0];
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.selectorRef) {
      return;
    }

    const clickedInside = this.selectorRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }  

  protected filterSelectorEvent(selectorId: string, selectedOption: SelectorOption): void {}
}
