import {
  Actions,
  ComponentInterface,
  Dependencies,
  Model,
  States,
  Views
} from '../types/component';
import { ModuleIntrface } from '../types/module';
import { Template } from './template';

export class Component implements ComponentInterface {
  private _components: Dependencies;
  private _uuid: string;
  private _element: HTMLElement;
  private _module: ModuleIntrface;
  private _model: Model = { transient: {} };

  constructor(
    model: Model,
    uuid: string,
    element: HTMLElement,
    module: ModuleIntrface
  ) {
    this._model = { ...this._model, ...model };
    this._uuid = uuid;
    this._element = element;
    this._module = module;
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

  public get module(): ModuleIntrface {
    return this._module;
  }

  public get components(): Dependencies {
    return this._components;
  }

  public get element(): HTMLElement {
    return this._element;
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

  protected get model(): Model {
    return this._model;
  }

  protected present(_data: any, _external?: boolean): void {}

  protected representation(_model: any): void {}

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
