import { WithElement } from './common';
import { ComponentDefinition, ComponentInterface } from './component';
import { Configuration } from './configuration';

interface AppRootInterface extends WithElement {
  mountComponents(
    components: ComponentDefinition[],
    appData: object
  ): ComponentInterface[];
  getAppData(): object;
  getConfiguration(): Configuration;
  getRouterOutlet(): Element;
  getMountedComponents(): ComponentInterface[];
  replaceRouterOutlet(routerOutlet: Element, moduleName: string): Element;
}

export { AppRootInterface };
