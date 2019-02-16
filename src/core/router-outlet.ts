import { ComponentInterface } from '../types/component';
import { RouteInterface } from '../types/router';
import { RouterOutletInterface } from '../types/router-outlet';
import { AppRoot } from './app-root';

export class RouterOutlet implements RouterOutletInterface {
  private appRoot: AppRoot;
  private routerOutletCache: { [key: string]: any };
  private componentsLoadedEvent: CustomEvent;

  constructor(appRoot: AppRoot) {
    this.appRoot = appRoot;
    this.routerOutletCache = {};
    this.componentsLoadedEvent = new CustomEvent('__components_loaded__');
  }

  public element(): Element {
    return this.appRoot.getRouterOutlet();
  }

  public replaceContent(pathname: string, route: RouteInterface): void {
    if (pathname in this.routerOutletCache) {
      this.routerOutletCache[
        location.pathname
      ] = this.appRoot.replaceRouterOutlet(
        this.routerOutletCache[pathname],
        route.module.name
      );
    } else {
      const appData: object = this.appRoot.getAppData();
      const appRootComponents: ComponentInterface[] = this.appRoot.getMountedComponents();
      if (!!route.resolver) {
        route.resolver.resolve().then(data => {
          route.module.template.getProperties().forEach((property: string) => {
            if (!(property in data)) {
              data = { ...data, [property]: null };
            }
          });
          this.routerOutletCache[pathname] = route.module.render(
            {
              ...appData,
              ...data
            },
            appRootComponents
          );
          const allComponents: ComponentInterface[] = appRootComponents.concat(
            route.module.getMountedComponents()
          );
          route.module.assignDependencies(allComponents);
          allComponents.forEach(component =>
            component.element.dispatchEvent(this.componentsLoadedEvent)
          );
          allComponents.forEach(
            component => component.onInit && component.onInit()
          );
          this.appRoot.replaceRouterOutlet(
            this.routerOutletCache[pathname],
            route.module.name
          );
        });
      } else {
        this.routerOutletCache[pathname] = route.module.render(
          appData,
          appRootComponents
        );
        const allComponents: ComponentInterface[] = appRootComponents.concat(
          route.module.getMountedComponents()
        );
        route.module.assignDependencies(allComponents);
        allComponents.forEach(component =>
          component.element.dispatchEvent(this.componentsLoadedEvent)
        );
        allComponents.forEach(
          component => component.onInit && component.onInit()
        );
        this.appRoot.replaceRouterOutlet(
          this.routerOutletCache[pathname],
          route.module.name
        );
      }
    }
  }
}
