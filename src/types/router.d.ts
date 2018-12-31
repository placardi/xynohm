import { Nameable } from './common';
import { ModuleDefinition, ModuleIntrface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
}

interface RouteInterface extends Nameable, WithPath {
  readonly module: ModuleIntrface;
  readonly resolver: ResolverIntrface | undefined;
}

interface RouteDefinitionInterface extends Nameable, WithPath {
  readonly module: ModuleDefinition;
  readonly resolver?: ResolverDefinition;
}

interface WithPath {
  readonly path: string;
}

export { RouterInterface, RouteInterface, RouteDefinitionInterface };
