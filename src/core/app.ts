import { AppInterface, Completable } from '../types/app';
import { Executable } from '../types/common';
import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { GuardDefinition } from '../types/guard';
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
  private guards: GuardDefinition[];
  private onReady: Executable;

  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routeDefinitions: RouteDefinitionInterface[],
    guards: GuardDefinition[]
  ) {
    this.guards = guards || [];
    this.components = components;
    this.configuration = configuration;
    this.appRoot = new AppRoot(this.configuration, components);
    this.routerOutlet = new RouterOutlet(this.appRoot);
    this.router = new Router(
      this.initRoutes(routeDefinitions),
      this.configuration,
      this.routerOutlet
    );
  }

  public run(): Completable {
    this.setBaseHref();
    document.addEventListener('DOMContentLoaded', this.onDOMLoaed.bind(this));
    return this;
  }

  public ready(executable: Executable): void {
    this.onReady = executable;
  }

  private onDOMLoaed(): void {
    this.processGuards().then(data => {
      this.appRoot.mountComponents(data);
      this.router.navigate();
      if (!!this.onReady) {
        this.onReady();
      }
    });
  }

  private processGuards(): Promise<object> {
    return this.guards.reduce(
      (data: Promise<object>, guard: GuardDefinition) => {
        return new guard().check().then(result => {
          return data.then(results => {
            return { ...results, ...result };
          });
        });
      },
      Promise.resolve({})
    );
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
      (!!definition.resolver ? definition.resolver.prototype.resolve : true)
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
