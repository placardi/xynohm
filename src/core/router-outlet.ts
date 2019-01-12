import { RouteInterface } from '../types';
import { RouterOutletInterface } from '../types/router-outlet';
import { AppRoot } from './app-root';

export class RouterOutlet implements RouterOutletInterface {
  private appRoot: AppRoot;
  private routerOutletCache: { [key: string]: any };

  constructor(appRoot: AppRoot) {
    this.appRoot = appRoot;
    this.routerOutletCache = {};
  }

  public element(): Element {
    return this.appRoot.getRouterOutlet();
  }

  public replaceContent(pathname: string, route: RouteInterface): void {
    if (pathname in this.routerOutletCache) {
      this.routerOutletCache[
        location.pathname
      ] = this.appRoot.replaceRouterOutlet(this.routerOutletCache[pathname]);
    } else {
      if (!!route.resolver) {
        route.resolver.resolve().then(data => {
          this.routerOutletCache[pathname] = route.module.render(data || {});
          this.appRoot.replaceRouterOutlet(this.routerOutletCache[pathname]);
        });
      } else {
        this.routerOutletCache[pathname] = route.module.render({});
        this.appRoot.replaceRouterOutlet(this.routerOutletCache[pathname]);
      }
    }
  }
}