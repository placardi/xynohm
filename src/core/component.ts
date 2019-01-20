import {
  Actions,
  ComponentInterface,
  Dependencies,
  Model,
  States,
  Views
} from '../types/component';
import { ComponentMounter } from '../types/mounter';
import { Template } from './template';

export class Component implements ComponentInterface {
  private _components: Dependencies;
  private _uuid: string;
  private _element: HTMLElement;
  private _mounter: ComponentMounter;
  private _model: Model = { transient: {} };

  constructor(model: Model, uuid: string, element: HTMLElement) {
    this._model = { ...this._model, ...model };
    this._uuid = uuid;
    this._element = element;
    this._element.addEventListener('__components_loaded__', () =>
      this.states.render(this._model)
    );
  }

  public get name(): string {
    return this.constructor.name;
  }

  public get uuid(): string {
    return this._uuid;
  }

  public get components(): Dependencies {
    return this._components;
  }

  public get element(): HTMLElement {
    return this._element;
  }

  public get mounter(): ComponentMounter {
    return this._mounter;
  }

  public static get template(): Template {
    return new Template(
      document.querySelector('template[component="' + this.name + '"]') ||
        document.createElement('template')
    );
  }

  public get actions(): Actions {
    return {};
  }

  public setDependencies(dependencies: Dependencies): void {
    this._components = dependencies;
  }

  public setMounter(mounter: ComponentMounter): void {
    this._mounter = mounter;
  }

  protected get model(): Model {
    return this._model;
  }

  protected present(_data: any, _external?: boolean): void {}

  protected representation(_model: Model): void {}

  protected get states(): States {
    return {
      render: (model: Model, external?: boolean): void => {
        this.representation(model);
        this.next(model, external);
        model.transient = {};
      }
    };
  }

  protected get views(): Views {
    return {};
  }

  protected next(_model: Model, _external?: boolean): void {}
}
