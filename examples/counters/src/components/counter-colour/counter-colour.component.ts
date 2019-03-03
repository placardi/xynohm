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

export class CounterColourComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      paintPositive: ({ external }: ActionInput) =>
        this.present({ data: { state: 'positive' }, external }),
      paintNegative: ({ external }: ActionInput) =>
        this.present({ data: { state: 'negative' }, external }),
      paintNeutral: ({ external }: ActionInput) =>
        this.present({ data: { state: 'neutral' }, external })
    };
  }

  protected present({ data, external }: PresentInput): void {
    if ('state' in data) {
      this.model.state = data.state;
    }
    this.states.render({ model: this.model, external });
  }

  protected representation(model: Model): void {
    if (this.states.positive({ model })) {
      this.views.positive({ model, element: this.element });
    }
    if (this.states.negative({ model })) {
      this.views.negative({ model, element: this.element });
    }
    if (this.states.neutral({ model })) {
      this.views.neutral({ model, element: this.element });
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      positive: ({ model }: StateInput) => model.state === 'positive',
      negative: ({ model }: StateInput) => model.state === 'negative',
      neutral: ({ model }: StateInput) => model.state === 'neutral'
    };
  }

  protected get views(): Views {
    return {
      positive: ({ element }: ViewInput) => {
        element.classList.remove('negative', 'neutral');
        element.classList.add('positive');
      },
      negative: ({ element }: ViewInput) => {
        element.classList.remove('positive', 'neutral');
        element.classList.add('negative');
      },
      neutral: ({ element }: ViewInput) => {
        element.classList.remove('positive', 'negative');
        element.classList.add('neutral');
      }
    };
  }
}
