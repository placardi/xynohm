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
    WithParsedPath,
    WithData {
  readonly module: ModuleInterface;
  readonly resolver: ResolverIntrface | undefined;
  readonly partial?: boolean;
  readonly redirectTo?: string;
  readonly children?: RouteInterface[];
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

interface WithParsedPath {
  getParsedPath(): string;
  setParsedPath(path: string): void;
}

interface WithData {
  getData(): object;
  setData(data: object): void;
}

interface Activateable {
  activate(): void;
  deactivate(): void;
  isActive(): boolean;
}

export { RouteInterface, RouteDefinitionInterface };
