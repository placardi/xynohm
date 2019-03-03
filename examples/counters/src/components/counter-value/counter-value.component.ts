import {
  ActionInput,
  Actions,
  Component,
  Model,
  PresentInput,
  StateInput,
  States,
  ViewInput,
  Views
} from '@placardi/xynohm';

export class CounterValueComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      setValue: ({ data, external }: ActionInput) =>
        this.present({ data: { value: data.value }, external })
    };
  }

  protected present({ data, external }: PresentInput): void {
    if ('value' in data) {
      this.model.value = data.value;
    }
    this.states.render({ model: this.model, external });
  }

  protected representation(model: Model): void {
    if (this.states.changed({ model })) {
      this.views.changed({ model, element: this.element });
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      changed: ({ model }: StateInput) => Number.isInteger(model.value)
    };
  }

  protected get views(): Views {
    return {
      changed: ({ model, element }: ViewInput) => {
        element.innerHTML = model.value;
      }
    };
  }
}
