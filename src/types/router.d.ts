import { Nameable } from './common';
import { ComponentInterface } from './component';
import { ModuleDefinition, ModuleInterface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
  registerAnchorsWithRoutePaths(element: Element): void;
}

export { Navigateable, RouterInterface };
