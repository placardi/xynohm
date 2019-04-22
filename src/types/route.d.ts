import { Nameable } from './common';
import { Configuration } from './configuration';
import { ComponentDefinition, ComponentInterface } from './component';
import { ModuleDefinition, ModuleInterface } from './module';
import { ResolverDefinition, ResolverIntrface } from './resolver';
import { RouterInterface } from './router';
import { RouterOutletInterface } from './router-outlet';

interface RouteInterface
  extends Activateable,
    Nameable,
    WithPath,
    WithData,
    WithRouter {
  readonly module: ModuleInterface;
  readonly resolver: ResolverIntrface | undefined;
  readonly partial?: boolean;
  readonly redirectTo?: string;
  readonly children?: RouteInterface[];
  init(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ): void;
}

interface RouteDefinitionInterface extends Nameable, WithPath {
  readonly module: ModuleDefinition;
  readonly resolver?: ResolverDefinition;
  readonly partial?: boolean;
  readonly redirectTo?: string;
  readonly children?: RouteDefinitionInterface[];
}

interface WithPath {
  readonly path: string;
}

interface WithData {
  getData(): object;
  setData(data: object): void;
}

interface WithRouter {
  getRouter(): RouterInterface;
  setRouter(router: RouterInterface): void;
}

interface Activateable {
  activate(): void;
  deactivate(): void;
  isActive(): boolean;
}

export { RouteInterface, RouteDefinitionInterface };
