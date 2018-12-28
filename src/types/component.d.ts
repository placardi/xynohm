import { Nameable } from './common';
import { ModuleIntrface } from './module';
import { TemplateInterface } from './template';

type Action = (data?: any, external?: boolean) => void;
type State = (model: any) => boolean;
type View = (model: any, element: HTMLElement) => void;
type Render = (model: any, external?: boolean) => void;

interface Actions {
  readonly [key: string]: Action;
}

interface Actionable {
  [key: string]: Actions[];
}

interface States {
  readonly [key: string]: State | Render;
}

interface Views {
  readonly [key: string]: View;
}

interface Dependencies {
  readonly parents: Actionable;
  readonly children: Actionable;
  readonly siblings: Actionable;
  readonly globals: Actionable;
}

interface ComponentInterface extends Nameable, Unique {
  readonly actions: Actions;
  readonly module: ModuleIntrface;
  readonly element: HTMLElement;
  readonly components: Dependencies;
  setDependencies(dependencies: Dependencies): void;
}

interface ComponentDefinition extends Templateable {
  new (
    model: any,
    uuid: string,
    element: HTMLElement,
    module: ModuleIntrface
  ): ComponentInterface;
}

interface Templateable {
  readonly template: TemplateInterface;
}

interface Unique {
  readonly uuid: string;
}

export {
  Actions,
  States,
  Views,
  Actionable,
  Dependencies,
  ComponentInterface,
  ComponentDefinition
};
