import { RouterOutletInterface } from './router-outlet';
import { Nameable, Templateable } from './common';
import { ComponentDefinition, ComponentInterface } from './component';
import { Configuration } from './configuration';
import { RouterInterface } from './router';

interface ModuleInterface extends Nameable, Renderable, Templateable {}

interface Renderable {
  render(
    data: object,
    components: ComponentInterface[],
    path: string
  ): HTMLElement;
  getMountedComponents(path: string): ComponentInterface[];
  assignDependencies(components: ComponentInterface[]): void;
}

interface ModuleDefinitionInput {
  components: ComponentDefinition[];
  configuration: Configuration;
  router: RouterInterface;
  routerOutlet: RouterOutletInterface;
}

type ModuleDefinition = new (input: ModuleDefinitionInput) => ModuleInterface;

export { ModuleInterface, ModuleDefinition, ModuleDefinitionInput };
