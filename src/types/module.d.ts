import { Nameable } from './common';
import { ComponentDefinition } from './component';
import { Configuration } from './configuration';

interface ModuleIntrface extends Nameable, Renderable {
  mount(
    component: ComponentDefinition,
    properties: object,
    events?: Attr[],
    internal?: boolean
  ): HTMLElement;
  unmount(elementID: string): void;
}

interface Renderable {
  render(data: object): void;
}

type ModuleDefinition = new (
  components: ComponentDefinition[],
  configuration: Configuration,
  routerOutlet: HTMLElement
) => ModuleIntrface;

export { ModuleIntrface, ModuleDefinition };
