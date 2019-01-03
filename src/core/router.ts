import { Configuration } from '../types/configuration';
import { RouteInterface, RouterInterface } from '../types/router';

export class Router implements RouterInterface {
  private routes: RouteInterface[];
  private configuration: Configuration;
  private routerOutlet: HTMLElement;

  constructor(
    routes: RouteInterface[],
    configuration: Configuration,
    routerOutlet: HTMLElement
  ) {
    this.routes = routes;
    this.configuration = configuration;
    this.routerOutlet = routerOutlet;
    this.registerAnchorsWithRoutePaths();
    window.onpopstate = this.navigate.bind(this, undefined);
  }

  public navigate(path?: string): void {
    const pathname: string = path || this.getPathnameWithoutBaseHref();
    const route: RouteInterface = this.matchRoute(pathname);
    this.replaceRouterOutletContent(route);
    if (path) {
      history.pushState(
        null,
        route.name,
        this.createPath(pathname, route.path)
      );
    }
  }

  private getPathnameWithoutBaseHref(): string {
    return this.configuration.baseHref === '/'
      ? location.pathname
      : location.pathname.replace(this.configuration.baseHref, '');
  }

  private matchRoute(path: string): RouteInterface {
    let route = this.routes.find(this.isValidRoute(path));
    if (!route) {
      route = this.routes.find(this.isFallbackRoute);
      if (!route) {
        throw new Error('No fallback route provided');
      }
    }
    return route;
  }

  private isValidRoute(path: string): (route: RouteInterface) => boolean {
    return (route: RouteInterface) => route.path === path;
  }

  private isFallbackRoute(route: RouteInterface): boolean {
    return route.path === '**';
  }

  private createPath(requestedPath: string, routePath?: string): string {
    const baseHref: string =
      this.configuration.baseHref === '/' ? '' : this.configuration.baseHref;
    const path = routePath === '**' ? requestedPath : routePath;
    return location.origin + baseHref + path;
  }

  private replaceRouterOutletContent(route: RouteInterface): void {
    if (!!route.resolver) {
      if (!!route.resolver.resolve) {
        route.resolver.resolve().then(data => route.module.render(data || {}));
      } else {
        throw new Error(
          route.resolver.name + ' must implement a resolve function'
        );
      }
    } else {
      route.module.render({});
    }
    this.registerAnchorsWithRoutePaths(this.routerOutlet);
  }

  private registerAnchorsWithRoutePaths(content?: HTMLElement): void {
    (content || document).querySelectorAll('a[routePath]').forEach(element => {
      const routePath: string | null = element.getAttribute('routePath');
      if (routePath) {
        element.setAttribute('href', this.createPath(routePath));
        element.addEventListener('click', e => {
          e.preventDefault();
          this.navigate(routePath);
        });
      }
    });
  }
}
