import { Actions, Component, Model, States, Views } from '@placardi/xynohm';

export class CounterValueComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      setValue: (data?: any, external?: boolean) =>
        this.present({ value: data.value }, external)
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('value' in data) {
      this.model.value = data.value;
    }
    this.states.render(this.model, external);
  }

  protected representation(model: Model): void {
    if (this.states.changed(model)) {
      this.views.changed(model, this.element);
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      changed: (model: Model) => Number.isInteger(model.value)
    };
  }

  protected get views(): Views {
    return {
      changed: (model: Model, element: HTMLElement) => {
        element.innerHTML = model.value;
      }
    };
  }
}
