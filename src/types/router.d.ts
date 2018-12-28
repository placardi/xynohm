import { Nameable } from './common';
import { ModuleDefinitionIntrface, ModuleIntrface } from './module';
import { ResolverDefinitionIntrface, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
}

interface RouteInterface extends Nameable, WithPath {
  readonly module: ModuleIntrface;
  readonly resolver: ResolverIntrface | undefined;
}

interface RouteDefinitionInterface extends Nameable, WithPath {
  readonly module: ModuleDefinitionIntrface;
  readonly resolver?: ResolverDefinitionIntrface;
}

interface WithPath {
  readonly path: string;
}

export { RouterInterface, RouteInterface, RouteDefinitionInterface };
