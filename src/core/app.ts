import { AppInterface, Completable } from '../types/app';
import { Executable } from '../types/common';
import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { GuardDefinition } from '../types/guard';
import { RouteDefinitionInterface } from '../types/route';
import { RouterInterface } from '../types/router';
import { RouterOutletInterface } from '../types/router-outlet';
import { AppRoot } from './app-root';
import { Router } from './router';
import { RouterOutlet } from './router-outlet';

export class App implements AppInterface {
  private components: ComponentDefinition[];
  private configuration: Configuration;
  private router: RouterInterface;
  private appRoot: AppRoot;
  private routerOutlet: RouterOutletInterface;
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
    this.appRoot = new AppRoot(this.configuration);
    this.routerOutlet = new RouterOutlet(this.appRoot);
    this.router = new Router(
      routeDefinitions,
      this.configuration,
      this.components,
      this.routerOutlet
    );
    this.appRoot.initMounter(components, this.router);
  }

  public run(): Completable {
    this.setBaseHref();
    document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));
    return this;
  }

  public ready(executable?: Executable): void {
    if (!!executable) {
      this.onReady = executable;
    }
  }

  private onDOMLoaded(): void {
    this.processGuards().then(data => {
      this.appRoot.mountComponents(data);
      this.router.registerAnchorsWithRoutePaths(this.appRoot.element());
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
