import { Injectable, EventEmitter } from '@angular/core';
import { ToggleableComponent } from './toggleable-component';

@Injectable({
  providedIn: 'root',
})
export class ToggleService {
  private readonly components: Map<string, ToggleableComponent> = new Map();
  public onToggledStateChange: EventEmitter<{ componentId: string; isOpen: boolean }> = new EventEmitter();

  registerComponent(component: ToggleableComponent): void {
    if (!this.components.has(component.componentId)) {
      this.components.set(component.componentId, component);
    }
  }

  unregisterComponent(componentId: string): void {
    this.components.delete(componentId);
  }

  toggle(componentId: string): void {
    const component = this.components.get(componentId);
    if (component) {
      component.toggle();
      this.emitStateChange(componentId, component.isOpen);
    }
  }

  open(componentId: string): void {
    console.log('Open:', componentId);
    const component = this.components.get(componentId);
    if (component && !component.isOpen) {
      component.open();
      this.emitStateChange(componentId, true);
    }
  }

  close(componentId: string): void {
    const component = this.components.get(componentId);
    if (component && component.isOpen) {
      component.close();
      this.emitStateChange(componentId, false);
    }
  }

  isOpen(componentId: string): boolean {
    const component = this.components.get(componentId);
    return component ? component.isOpen : false;
  }

  private emitStateChange(componentId: string, isOpen: boolean): void {
    this.onToggledStateChange.emit({ componentId, isOpen });
  }
}
