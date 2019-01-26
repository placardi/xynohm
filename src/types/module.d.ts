import { RouterOutlet } from '../core/router-outlet';
import { Nameable, Templateable } from './common';
import { ComponentDefinition, ComponentInterface } from './component';
import { Configuration } from './configuration';

interface ModuleInterface extends Nameable, Renderable, Templateable {}

interface Renderable {
  render(data: object, components: ComponentInterface[]): HTMLElement;
  getMountedComponents(): ComponentInterface[];
  assignDependencies(components: ComponentInterface[]): void;
}

type ModuleDefinition = new (
  components: ComponentDefinition[],
  configuration: Configuration,
  routerOutlet: RouterOutlet
) => ModuleInterface;

export { ModuleInterface, ModuleDefinition };
