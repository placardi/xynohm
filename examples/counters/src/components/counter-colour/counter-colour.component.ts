import {
  Actions,
  Component,
  Model,
  ModuleIntrface,
  States,
  Views
} from '@placardi/xynohm';

export class CounterColourComponent extends Component {
  constructor(
    model: Model,
    uuid: string,
    element: HTMLElement,
    module: ModuleIntrface
  ) {
    super(model, uuid, element, module);
  }

  public get actions(): Actions {
    return {
      paintPositive: (_data?: any, external?: boolean) =>
        this.present({ state: 'positive' }, external),
      paintNegative: (_data?: any, external?: boolean) =>
        this.present({ state: 'negative' }, external),
      paintNeutral: (_data?: any, external?: boolean) =>
        this.present({ state: 'neutral' }, external)
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('state' in data) {
      this.model.state = data.state;
    }
    this.states.render(this.model, external);
  }

  protected representation(model: Model): void {
    if (this.states.positive(model)) {
      this.views.positive(model, this.element);
    }
    if (this.states.negative(model)) {
      this.views.negative(model, this.element);
    }
    if (this.states.neutral(model)) {
      this.views.neutral(model, this.element);
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      positive: (model: Model) => model.state === 'positive',
      negative: (model: Model) => model.state === 'negative',
      neutral: (model: Model) => model.state === 'neutral'
    };
  }

  protected get views(): Views {
    return {
      positive: (_model: Model, element: HTMLElement) => {
        element.classList.remove('negative', 'neutral');
        element.classList.add('positive');
      },
      negative: (_model: Model, element: HTMLElement) => {
        element.classList.remove('positive', 'neutral');
        element.classList.add('negative');
      },
      neutral: (_model: Model, element: HTMLElement) => {
        element.classList.remove('positive', 'negative');
        element.classList.add('neutral');
      }
    };
  }
}
