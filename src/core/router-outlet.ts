import { ComponentInterface } from '../types/component';
import { RouteInterface } from '../types/router';
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
      const appData: object = this.appRoot.getAppData();
      const components: ComponentInterface[] = this.appRoot.getMountedComponents();
      if (!!route.resolver) {
        route.resolver.resolve().then(data => {
          this.routerOutletCache[pathname] = route.module.render(
            {
              ...appData,
              ...data
            },
            components
          );
          this.appRoot.replaceRouterOutlet(this.routerOutletCache[pathname]);
        });
      } else {
        this.routerOutletCache[pathname] = route.module.render(
          appData,
          components
        );
        this.appRoot.replaceRouterOutlet(this.routerOutletCache[pathname]);
      }
    }
  }
}
