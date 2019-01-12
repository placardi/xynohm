import { RouteInterface } from './router';

interface RouterOutletInterface {
  element(): Element;
  replaceContent(pathname: string, route: RouteInterface): void;
}

export { RouterOutletInterface };
