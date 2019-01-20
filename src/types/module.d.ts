import { RouterOutlet } from '../core/router-outlet';
import { Nameable } from './common';
import { ComponentDefinition, ComponentInterface } from './component';
import { Configuration } from './configuration';

interface ModuleInterface extends Nameable, Renderable {}

interface Renderable {
  render(data: object, components: ComponentInterface[]): HTMLElement;
}

type ModuleDefinition = new (
  components: ComponentDefinition[],
  configuration: Configuration,
  routerOutlet: RouterOutlet
) => ModuleInterface;

export { ModuleInterface, ModuleDefinition };
