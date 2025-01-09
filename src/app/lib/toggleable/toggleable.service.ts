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
      console.log('Component registered:', component.componentId);
    }
  }

  unregisterComponent(componentId: string): void {
    this.components.delete(componentId);
    console.log('Component unregistered:', componentId);
  }

  toggle(componentId: string): void {
    const component = this.getComponent(componentId);
    if (component) {
      component.toggle();
      this.emitStateChange(componentId, component.isOpen);
    }
  }

  open(componentId: string): void {
    const component = this.getComponent(componentId);
    if (component && !component.isOpen) {
      component.open();
      this.emitStateChange(componentId, true);
      console.log('Opened:', componentId);
    }
  }

  close(componentId: string): void {
    const component = this.getComponent(componentId);
    if (component && component.isOpen) {
      component.close();
      this.emitStateChange(componentId, false);
      console.log('Closed:', componentId);
    }
  }

  isOpen(componentId: string): boolean {
    const component = this.getComponent(componentId);
    return component ? component.isOpen : false;
  }

  private getComponent(componentId: string): ToggleableComponent | null {
    const component = this.components.get(componentId);
    if (!component) {
      console.warn(`Component with ID '${componentId}' not found.`);
      return null;
    }
    return component;
  }

  private emitStateChange(componentId: string, isOpen: boolean): void {
    this.onToggledStateChange.emit({ componentId, isOpen });
  }
}
