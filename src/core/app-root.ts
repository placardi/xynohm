import { AppRootInterface } from '../types/app-root';

export class AppRoot implements AppRootInterface {
  public getRouterOutlet(): Element {
    const routerOutlet: Element = document.getElementsByTagName(
      'router-outlet'
    )[0];
    if (!routerOutlet) {
      throw new Error('router-outlet element in app-root not found');
    }
    return routerOutlet;
  }

  public replaceRouterOutlet(routerOutlet: Element): Element {
    return this.element().replaceChild(routerOutlet, this.getRouterOutlet());
  }

  private element(): Element {
    const appRoot: Element = document.getElementsByTagName('app-root')[0];
    if (!appRoot) {
      throw new Error('app-root element not found');
    }
    return appRoot;
  }
}
