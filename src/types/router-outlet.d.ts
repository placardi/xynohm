import { AppRoot } from '../core/app-root';
import { WithElement } from './common';
import { ComponentInterface } from './component';
import { RouteInterface } from './route';

interface RouterOutletInterface extends WithElement {
  replaceContent(pathname: string, route: RouteInterface): Promise<Element>;
  getAppRoot(): AppRoot;
}

export { RouterOutletInterface };
