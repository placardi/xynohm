import { Nameable } from './common';
import { ComponentInterface } from './component';
import { ModuleDefinition, ModuleInterface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
  registerAnchorsWithRoutePaths(element: Element): void;
}

interface RouteInterface extends Activateable, Nameable, WithPath {
  readonly module: ModuleInterface;
  readonly resolver: ResolverIntrface | undefined;
}

interface RouteDefinitionInterface extends Nameable, WithPath {
  readonly module: ModuleDefinition;
  readonly resolver?: ResolverDefinition;
}

interface WithPath {
  readonly path: string;
}

interface Activateable {
  activate(): void;
  deactivate(): void;
  isActive(): boolean;
}

export {
  Navigateable,
  RouterInterface,
  RouteInterface,
  RouteDefinitionInterface
};
