import { Nameable } from './common';
import { ComponentInterface } from './component';
import { ModuleDefinition, ModuleInterface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';

interface RouterInterface extends Navigateable {}

interface Navigateable {
  navigate(path?: string): void;
}

interface RouteInterface extends Nameable, WithPath {
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

export {
  Navigateable,
  RouterInterface,
  RouteInterface,
  RouteDefinitionInterface
};
