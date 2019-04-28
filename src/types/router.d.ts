import { Nameable } from './common';
import { ComponentInterface } from './component';
import { RouteInterface } from './route';
import { ModuleDefinition, ModuleInterface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
  registerAnchorsWithRoutePaths(element: Element): void;
  getActiveRoute(): RouteInterface | undefined;
}

export { Navigateable, RouterInterface };
