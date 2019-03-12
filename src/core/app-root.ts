import { AppRootInterface } from '../types/app-root';
import { ComponentDefinition, ComponentInterface } from '../types/component';
import { Configuration } from '../types/configuration';
import { Mounter } from './mounter';

export class AppRoot implements AppRootInterface {
  private mounter: Mounter;
  private appData: object;
  private configuration: Configuration;
  private mountedComponents: ComponentInterface[];

  constructor(configuration: Configuration, components: ComponentDefinition[]) {
    this.appData = {};
    this.configuration = configuration;
    this.mounter = new Mounter(this, this.configuration, components);
  }

  public mountComponents(appData: object): ComponentInterface[] {
    this.appData = appData;
    this.mountedComponents = this.mounter.mountComponents(
      [],
      this.element().childNodes,
      this.appData
    );
    return this.mountedComponents;
  }

  public getAppData(): object {
    return this.appData;
  }

  public getConfiguration(): Configuration {
    return this.configuration;
  }

  public getMountedComponents(): ComponentInterface[] {
    return this.mountedComponents || [];
  }

  public getRouterOutlet(): Element {
    const routerOutlet: Element = document.getElementsByTagName(
      'router-outlet'
    )[0];
    if (!routerOutlet) {
      throw new Error('router-outlet element in app-root not found');
    }
    return routerOutlet;
  }

  public replaceRouterOutlet(
    newRouterOutlet: Element,
    moduleName: string
  ): Element {
    newRouterOutlet.setAttribute('module', moduleName);
    const currentRouterOutlet: Element = this.getRouterOutlet();
    return (currentRouterOutlet.parentElement as HTMLElement).replaceChild(
      newRouterOutlet,
      currentRouterOutlet
    );
  }

  public element(): Element {
    const appRoot: Element = document.getElementsByTagName('app-root')[0];
    if (!appRoot) {
      throw new Error('app-root element not found');
    }
    return appRoot;
  }
}
