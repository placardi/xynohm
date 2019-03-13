import { Configuration } from '../types/configuration';
import { RouteInterface, RouterInterface } from '../types/router';
import { RouterOutlet } from './router-outlet';

export class Router implements RouterInterface {
  private routes: RouteInterface[];
  private configuration: Configuration;
  private routerOutlet: RouterOutlet;

  constructor(
    routes: RouteInterface[],
    configuration: Configuration,
    routerOutlet: RouterOutlet
  ) {
    this.routes = routes;
    this.configuration = configuration;
    this.routerOutlet = routerOutlet;
    this.registerAnchorsWithRoutePaths(document.body);
    window.onpopstate = this.navigate.bind(this, undefined);
  }

  public navigate(path?: string): void {
    const pathname: string = path || this.getPathnameWithoutBaseHref();
    const route: RouteInterface = this.matchRoute(pathname);
    this.routerOutlet.replaceContent(pathname, route);
    this.registerAnchorsWithRoutePaths(this.routerOutlet.element());
    if (path) {
      history.pushState(
        null,
        route.name,
        this.createPath(route.path, pathname)
      );
    }
    if (
      this.configuration.removeTrailingSlash &&
      location.pathname.length > 1 &&
      location.pathname.endsWith('/')
    ) {
      history.replaceState(
        null,
        route.name,
        this.createPath(route.path, pathname)
      );
    }
    window.dispatchEvent(new Event('navigation'));
  }

  public registerAnchorsWithRoutePaths(element: Element): void {
    element.querySelectorAll('a[routePath]').forEach(anchor => {
      const routePath: string = anchor.getAttribute('routePath') as string;
      anchor.setAttribute('href', this.createPath(routePath));
      anchor.addEventListener('click', e => {
        e.preventDefault();
        if (routePath !== this.getPathnameWithoutBaseHref()) {
          this.navigate(routePath);
        }
      });
    });
  }

  private getPathnameWithoutBaseHref(): string {
    return this.removeTrailingSlash(
      this.configuration.baseHref === '/'
        ? location.pathname
        : location.pathname.replace(this.configuration.baseHref, '')
    );
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

  private removeTrailingSlash(path: string): string {
    return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  }

  private isValidRoute(path: string): (route: RouteInterface) => boolean {
    return (route: RouteInterface) =>
      route.path === this.removeTrailingSlash(path);
  }

  private isFallbackRoute(route: RouteInterface): boolean {
    return route.path === '**';
  }

  private createPath(routePath: string, fallbackPath?: string): string {
    const baseHref: string =
      this.configuration.baseHref === '/' ? '' : this.configuration.baseHref;
    const path: string = routePath === '**' ? fallbackPath || '' : routePath;
    return location.origin + baseHref + path;
  }
}
