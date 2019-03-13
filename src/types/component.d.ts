import { Nameable, Templateable } from './common';
import { ComponentMounter } from './mounter';

type Action = (args: ActionInput) => void;
type State = (args: StateInput) => boolean;
type View = (args: ViewInput) => void;
type Render = (args: RenderInput) => void;

interface Actions {
  readonly [key: string]: Action;
}

interface ActionInput {
  readonly data?: any;
  readonly external?: boolean;
  readonly event?: Event;
}

interface PresentInput {
  readonly data: any;
  readonly external?: boolean;
}

interface StateInput {
  readonly model: Model;
}

interface ViewInput {
  readonly model: Model;
  readonly element: HTMLElement;
}

interface RenderInput {
  readonly model: Model;
  readonly external?: boolean;
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

interface ComponentInterface
  extends Nameable,
    Unique,
    Partial<OnInit>,
    Partial<OnMount>,
    Partial<OnUnmount> {
  readonly actions: Actions;
  readonly element: HTMLElement;
  readonly components: Dependencies;
  setDependencies(dependencies: Dependencies): void;
  setMounter(mounter: ComponentMounter): void;
  getIsOnInitExecuted(): boolean;
  setIsOnInitExecuted(isOnInitExecuted: boolean): void;
  setGlobal(global: boolean): void;
  isGlobal(): boolean;
  setMounted(mounted: boolean): void;
  isMounted(): boolean;
}

interface ComponentDefinition extends Templateable {
  new (model: Model, uuid: string, element: HTMLElement): ComponentInterface;
}

interface Unique {
  readonly uuid: string;
}

interface OnInit {
  onInit(): void;
}

interface OnMount {
  onMount(): void;
}

interface OnUnmount {
  onUnmount(): void;
}

export {
  ActionInput,
  PresentInput,
  StateInput,
  ViewInput,
  RenderInput,
  Actions,
  States,
  Views,
  Model,
  Actionable,
  Dependencies,
  ComponentInterface,
  ComponentDefinition,
  OnInit,
  OnMount,
  OnUnmount
};
