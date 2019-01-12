import { AppInterface } from '../types/app';
import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import {
  RouteDefinitionInterface,
  RouteInterface,
  RouterInterface
} from '../types/router';
import { AppRoot } from './app-root';
import { Router } from './router';
import { RouterOutlet } from './router-outlet';

export class App implements AppInterface {
  private components: ComponentDefinition[];
  private configuration: Configuration;
  private router: RouterInterface;
  private appRoot: AppRoot;
  private routerOutlet: RouterOutlet;

  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routeDefinitions: RouteDefinitionInterface[]
  ) {
    this.components = components;
    this.configuration = configuration;
    this.appRoot = new AppRoot();
    this.routerOutlet = new RouterOutlet(this.appRoot);
    this.router = new Router(
      this.initRoutes(routeDefinitions),
      this.configuration,
      this.routerOutlet
    );
  }

  public run(): void {
    this.setBaseHref();
    document.addEventListener('DOMContentLoaded', () => this.router.navigate());
  }

  private initRoutes(
    routeDefinitions: RouteDefinitionInterface[]
  ): RouteInterface[] {
    return routeDefinitions.map(definition => {
      if (!this.isValidRouteDefinition(definition)) {
        throw new Error(
          `invalid route definition with name: ${definition.name} and path: ${
            definition.path
          }`
        );
      }
      return {
        name: definition.name,
        path: definition.path,
        module: new definition.module(
          this.components,
          this.configuration,
          this.routerOutlet
        ),
        resolver:
          (definition.resolver && new definition.resolver()) || undefined
      };
    });
  }

  private isValidRouteDefinition(
    definition: RouteDefinitionInterface
  ): boolean {
    return (
      typeof definition.name === 'string' &&
      definition.name.length > 0 &&
      typeof definition.path === 'string' &&
      definition.path.length > 0 &&
      (definition.path.charAt(0) === '/' || definition.path === '**') &&
      !!definition.module &&
      definition.module.prototype.__proto__.name === 'Module' &&
      (!!definition.resolver
        ? definition.resolver.prototype.__proto__.name === 'Resolver' &&
          definition.resolver.prototype.resolve
        : true)
    );
  }

  private setBaseHref() {
    let base: Element = document.getElementsByTagName('base')[0];
    if (!base) {
      base = document.createElement('base');
      document.head.insertBefore(base, document.head.firstChild);
    }
    base.setAttribute(
      'href',
      location.origin + (this.configuration.baseHref || '')
    );
  }
}
