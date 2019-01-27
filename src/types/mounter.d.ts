import { ComponentDefinition, ComponentInterface } from './component';

interface ComponentMounter {
  mountComponent(component: ComponentDefinition, data: object): HTMLElement;
  unmountComponent(elementID: string): void;
}

interface MounterInterface extends ComponentMounter {
  mountComponents(
    mountedComponents: ComponentInterface[],
    nodes: NodeList,
    data: object
  ): ComponentInterface[];
  getMountedComponents(): ComponentInterface[];
  getMountedElement(): HTMLElement;
  assignDependencies(components?: ComponentInterface[]): void;
}

export { ComponentMounter, MounterInterface };
