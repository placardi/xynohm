import { RouterOutlet } from '../core/router-outlet';
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
  render(data: object): Element;
}

type ModuleDefinition = new (
  components: ComponentDefinition[],
  configuration: Configuration,
  routerOutlet: RouterOutlet
) => ModuleIntrface;

export { ModuleIntrface, ModuleDefinition };
