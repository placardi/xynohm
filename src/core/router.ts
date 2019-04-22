import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { RouteInterface } from '../types/route';
import { RouterInterface } from '../types/router';
import { RouterOutletInterface } from '../types/router-outlet';
import { convertDataType, recreateNode, removeTrailingSlash } from './utils';

export class Router implements RouterInterface {
  private routes: RouteInterface[];
  private configuration: Configuration;
  private routerOutlet: RouterOutletInterface;
  private routeRegEx: RegExp = /\{\s*([a-zA-Z_][a-zA-Z0-9_-]*)\s*(?::\s*([^{}]*(?:\{(?!1)\}[^{}]*)*))?\}/g;

  constructor(
    routes: RouteInterface[],
    configuration: Configuration,
    components: ComponentDefinition[],
    routerOutlet: RouterOutletInterface
  ) {
    this.routes = routes.map(route => {
      route.setRouter(this);
      route.init(components, configuration, routerOutlet);
      return route;
    });
    this.configuration = configuration;
    this.routerOutlet = routerOutlet;
    this.registerAnchorsWithRoutePaths(document.body);
    window.onpopstate = this.navigate.bind(this, undefined);
  }

  public navigate(path?: string): void {
    this.routes
      .filter(r => r.isActive())
      .forEach(r => {
        r.module
          .getMountedComponents()
          .filter(c => !c.isGlobal() && c.isMounted())
          .forEach(c => {
            if (!!c.onUnmount && c.onUnmount instanceof Function) {
              c.setMounted(false);
              c.onUnmount();
            }
          });
        r.deactivate();
      });
    const pathname: string = path || this.getPathnameWithoutBaseHref();
    const route: RouteInterface = this.matchRoute(pathname);
    if (!!route.redirectTo) {
      return this.navigate(route.redirectTo);
    }
    route.activate();
    this.routerOutlet.replaceContent(pathname, route).then(content => {
      this.registerAnchorsWithRoutePaths(content);
      if (path) {
        history.pushState(
          null,
          route.name,
          this.createPath(route.getParsedPath(), pathname)
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
          this.createPath(route.getParsedPath(), pathname)
        );
      }
      window.dispatchEvent(new Event('navigation'));
    });
  }

  public registerAnchorsWithRoutePaths(element: Element): void {
    element.querySelectorAll('a[routePath]').forEach(anchor => {
      const routePath: string = anchor.getAttribute('routePath') as string;
      const clone: HTMLElement = recreateNode(anchor);
      clone.setAttribute('href', this.createPath(routePath));
      clone.addEventListener('click', e => {
        e.preventDefault();
        if (routePath !== this.getPathnameWithoutBaseHref()) {
          this.navigate(routePath);
        }
      });
    });
  }

  private getPathnameWithoutBaseHref(): string {
    return removeTrailingSlash(
      this.configuration.baseHref === '/'
        ? location.pathname
        : location.pathname.replace(this.configuration.baseHref, '')
    );
  }

  private matchRoute(path: string): RouteInterface {
    let route = this.flattenRoutes().find(this.isValidRoute(path));
    if (!route) {
      route = this.routes.find(this.isFallbackRoute);
      if (!route) {
        throw new Error('No fallback route provided');
      }
    }
    return route;
  }

  private isValidRoute(path: string): (route: RouteInterface) => boolean {
    const pathParts: string[] = path.split('/').filter(Boolean);
    return (route: RouteInterface) => {
      const routeParts: string[] = route.path.split('/').filter(Boolean);
      if (pathParts.length === routeParts.length) {
        const placeholders: string[] | null = route.path.match(this.routeRegEx);
        if (!!placeholders) {
          const pathPartsWithoutCommonParts: string[] = pathParts.filter(
            part => routeParts.indexOf(part) === -1
          );
          const filteredPlaceholdes: string[] = placeholders.filter(
            (placeholder, index) => {
              const matches: any[] = [];
              placeholder.replace(this.routeRegEx, (_, p1, p2) => {
                matches.push(p1, p2);
                return placeholder;
              });
              return !!matches[1]
                ? new RegExp(`^${matches[1]}$`).test(
                    pathPartsWithoutCommonParts[index]
                  )
                : true;
            }
          );
          if (
            filteredPlaceholdes.length === pathPartsWithoutCommonParts.length
          ) {
            const routeData: object = filteredPlaceholdes.reduce(
              (previous, current, index) => {
                const matches: string[] | null = new RegExp(
                  this.routeRegEx
                ).exec(current);
                return matches && matches.length > 1
                  ? {
                      ...previous,
                      [matches[1]]: convertDataType(
                        pathPartsWithoutCommonParts[index]
                      )
                    }
                  : previous;
              },
              {}
            );
            route.setData(routeData);
            route.setParsedPath(`/${pathParts.join('/')}`);
            return true;
          }
        }
      }
      return route.partial
        ? removeTrailingSlash(path).startsWith(route.path)
        : route.path === removeTrailingSlash(path);
    };
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

  private flattenRoutes(): RouteInterface[] {
    return this.routes.reduce(
      (previous: RouteInterface[], current) =>
        current.children && current.children instanceof Array
          ? previous.concat(current.children, current)
          : previous.concat(current),
      []
    );
  }
}
