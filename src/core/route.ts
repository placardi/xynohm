import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { ModuleInterface } from '../types/module';
import { ResolverIntrface } from '../types/resolver';
import { RouteDefinitionInterface, RouteInterface } from '../types/route';
import { RouterInterface } from '../types/router';
import { RouterOutletInterface } from '../types/router-outlet';

export class Route implements RouteInterface {
  private _name: string;
  private _path: string;
  private _parsedPath: string;
  private _definition: RouteDefinitionInterface;
  private _module: ModuleInterface;
  private _resolver?: ResolverIntrface;
  private _partial?: boolean;
  private _redirectTo?: string;
  private _children: RouteInterface[] = [];
  private _isActive: boolean = false;
  private _data: object = {};
  private _router: RouterInterface;

  constructor(
    definition: RouteDefinitionInterface,
    parentRoute?: RouteInterface
  ) {
    if (!this.isValidRouteDefinition(definition)) {
      throw new Error(
        `invalid route definition with name: ${definition.name} and path: ${
          definition.path
        }`
      );
    }
    this._definition = definition;
    this._name = this.createRouteName(definition, parentRoute);
    this._path = this.createRoutePath(definition, parentRoute);

    this._resolver =
      (definition.resolver && new definition.resolver()) || undefined;
    this._partial =
      typeof definition.partial === 'boolean' ? definition.partial : false;
    this._redirectTo = this.createRedirectionPath(definition);
  }

  public init(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ): void {
    this._module = new this._definition.module({
      components,
      configuration,
      routerOutlet,
      router: this.getRouter()
    });
    this._children =
      (this._definition.children instanceof Array &&
        this._definition.children.map(child => {
          const route: RouteInterface = new Route(child, this);
          route.init(components, configuration, routerOutlet);
          return route;
        })) ||
      [];
  }

  public get name(): string {
    return this._name;
  }

  public get path(): string {
    return this._path;
  }

  public get module(): ModuleInterface {
    return this._module;
  }

  public get resolver(): ResolverIntrface | undefined {
    return this._resolver;
  }

  public get partial(): boolean {
    return !!this._partial;
  }

  public get redirectTo(): string | undefined {
    return this._redirectTo;
  }

  public get children(): RouteInterface[] {
    return this._children;
  }

  public activate(): void {
    this._isActive = true;
  }

  public deactivate(): void {
    this._isActive = false;
  }

  public isActive(): boolean {
    return !!this._isActive;
  }

  public getData(): object {
    return this._data;
  }

  public setData(data: object): void {
    this._data = data;
  }

  public getParsedPath(): string {
    return this._parsedPath || this._path;
  }

  public setParsedPath(path: string): void {
    this._parsedPath = path;
  }

  public getRouter(): RouterInterface {
    return this._router;
  }

  public setRouter(router: RouterInterface): void {
    this._router = router;
  }

  private createRouteName(
    definition: RouteDefinitionInterface,
    parentRoute?: RouteInterface
  ): string {
    return parentRoute
      ? `${parentRoute.name}.${definition.name}`
      : definition.name;
  }

  private createRoutePath(
    definition: RouteDefinitionInterface,
    parentRoute?: RouteInterface
  ): string {
    if (parentRoute) {
      if (parentRoute.path.startsWith('/')) {
        if (definition.path.startsWith('/')) {
          return `${parentRoute.path}${definition.path}`;
        } else {
          return `${parentRoute.path}/${definition.path}`;
        }
      } else {
        if (definition.path.startsWith('/')) {
          return `/${parentRoute.path}${definition.path}`;
        } else {
          return `/${parentRoute.path}/${definition.path}`;
        }
      }
    } else {
      if (definition.path.startsWith('/')) {
        return `${definition.path}`;
      } else if (definition.path === '**') {
        return definition.path;
      } else {
        return `/${definition.path}`;
      }
    }
  }

  private createRedirectionPath(
    definition: RouteDefinitionInterface
  ): string | undefined {
    if (
      typeof definition.redirectTo === 'string' &&
      definition.redirectTo.length > 0
    ) {
      return definition.redirectTo.startsWith('/')
        ? `${definition.redirectTo}`
        : `/${definition.redirectTo}`;
    }
    return undefined;
  }

  private isValidRouteDefinition(
    definition: RouteDefinitionInterface
  ): boolean {
    return (
      typeof definition.name === 'string' &&
      definition.name.length > 0 &&
      typeof definition.path === 'string' &&
      (definition.path.length > 0 || definition.path === '**') &&
      !!definition.module &&
      (!!definition.resolver ? definition.resolver.prototype.resolve : true)
    );
  }
}
