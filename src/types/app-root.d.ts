import { WithElement } from './common';
import { ComponentDefinition, ComponentInterface } from './component';

interface AppRootInterface extends WithElement {
  mountComponents(
    components: ComponentDefinition[],
    appData: object
  ): ComponentInterface[];
  getAppData(): object;
  getRouterOutlet(): Element;
  getMountedComponents(): ComponentInterface[];
  replaceRouterOutlet(routerOutlet: Element): Element;
}

export { AppRootInterface };
