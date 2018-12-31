import { AppInterface } from '../types/app';
import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { ModuleDefinition, ModuleIntrface } from '../types/module';
import { ResolverDefinition, ResolverIntrface } from '../types/resolver';
import {
  RouteDefinitionInterface,
  RouteInterface,
  RouterInterface
} from '../types/router';
import { Router } from './router';

export class App implements AppInterface {
  private components: ComponentDefinition[];
  private configuration: Configuration;
  private router: RouterInterface;
  private appRoot: HTMLElement;
  private routerOutlet: HTMLElement;

  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routeDefinitions: RouteDefinitionInterface[]
  ) {
    this.components = components;
    this.configuration = configuration;
    this.appRoot = this.getAppRoot();
    this.routerOutlet = this.getRouterOutlet();
    this.router = new Router(
      this.initRoutes(routeDefinitions),
      this.configuration,
      this.routerOutlet
    );
  }

  public run(): void {
    document.addEventListener('DOMContentLoaded', () => this.router.navigate());
  }

  private initRoutes(
    routeDefinitions: RouteDefinitionInterface[]
  ): RouteInterface[] {
    return routeDefinitions.map(definition => {
      return {
        name: definition.name,
        path: definition.path,
        module: this.instantiateModule(definition.module),
        resolver: this.instantiateResolver(definition.resolver)
      };
    });
  }

  private instantiateModule(module: ModuleDefinition): ModuleIntrface {
    return new module(this.components, this.configuration, this.routerOutlet);
  }

  private instantiateResolver(
    resolver: ResolverDefinition | undefined
  ): ResolverIntrface | undefined {
    return !!resolver ? new resolver() : undefined;
  }

  private getAppRoot(): HTMLElement {
    const appRoot: HTMLElement | null = document.querySelector('app-root');
    if (!appRoot) {
      throw new Error('app-root element not found');
    }
    return appRoot;
  }

  private getRouterOutlet(): HTMLElement {
    const routerOutlet: HTMLElement | null = this.appRoot.querySelector(
      'router-outlet'
    );
    if (!routerOutlet) {
      throw new Error('router-outlet element in app-root not found');
    }
    return routerOutlet;
  }
}
