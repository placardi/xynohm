import { Nameable, Templateable } from './common';
import { ComponentMounter } from './mounter';

type Action = (data?: any, external?: boolean, event?: Event) => void;
type State = (model: Model) => boolean;
type View = (model: Model, element: HTMLElement) => void;
type Render = (model: Model, external?: boolean) => void;

interface Actions {
  readonly [key: string]: Action;
}

interface Actionable {
  [key: string]: Actions[];
}

interface Model {
  [key: string]: any;
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
  readonly element: HTMLElement;
  readonly components: Dependencies;
  setDependencies(dependencies: Dependencies): void;
  setMounter(mounter: ComponentMounter): void;
}

interface ComponentDefinition extends Templateable {
  new (model: Model, uuid: string, element: HTMLElement): ComponentInterface;
}

interface Unique {
  readonly uuid: string;
}

export {
  Actions,
  States,
  Views,
  Model,
  Actionable,
  Dependencies,
  ComponentInterface,
  ComponentDefinition
};
