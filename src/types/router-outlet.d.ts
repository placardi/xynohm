import { AppRoot } from '../core/app-root';
import { WithElement } from './common';
import { ComponentInterface } from './component';
import { RouteInterface } from './router';

interface RouterOutletInterface extends WithElement {
  replaceContent(pathname: string, route: RouteInterface): void;
  getAppRoot(): AppRoot;
}

export { RouterOutletInterface };
