import {
  ActionInput,
  Actions,
  Component,
  Model,
  OnInit,
  PresentInput,
  RenderInput,
  StateInput,
  States,
  ViewInput,
  Views
} from '@placardi/xynohm';

export class CounterComponent extends Component implements OnInit {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public onInit(): void {}

  public get actions(): Actions {
    return {
      add: ({ data, external }: ActionInput) =>
        this.present({ data: { increment: data.increment || 1 }, external }),
      subtract: ({ data, external }: ActionInput) =>
        this.present({ data: { decrement: data.decrement || 1 }, external }),
      reset: ({ data, external }: ActionInput) =>
        this.present({ data: { value: data.value || 0 }, external }),
      addHighlight: ({ external }: ActionInput) =>
        this.present({ data: { highlight: true }, external }),
      removeHighlight: ({ external }: ActionInput) =>
        this.present({ data: { highlight: false }, external })
    };
  }

  protected present({ data, external }: PresentInput): void {
    if ('increment' in data) {
      this.model.counter.value += data.increment;
    }
    if ('decrement' in data) {
      this.model.counter.value -= data.decrement;
    }
    if ('value' in data) {
      this.model.counter.value = data.value;
    }
    if ('highlight' in data) {
      this.model.highlight = data.highlight;
    }
    if ('increment' in data || 'decrement' in data || 'value' in data) {
      this.element.dispatchEvent(
        new CustomEvent('custom-event', {
          detail: {
            uuid: this.uuid,
            value: this.model.counter.value
          }
        })
      );
    }
    this.states.render({ model: this.model, external });
  }

  protected get states(): States {
    return {
      ...super.states,
      positive: ({ model }: StateInput) => model.counter.value > 0,
      negative: ({ model }: StateInput) => model.counter.value < 0,
      neutral: ({ model }: StateInput) => model.counter.value === 0,
      withHighlight: ({ model }: StateInput) => !!model.highlight,
      withoutHighlight: ({ model }: StateInput) => !model.highlight
    };
  }

  protected representation(model: Model): void {
    if (this.states.withHighlight({ model })) {
      this.views.withHighlight({ model, element: this.element });
    }
    if (this.states.withoutHighlight({ model })) {
      this.views.withoutHighlight({ model, element: this.element });
    }
  }

  protected get views(): Views {
    return {
      withHighlight: ({ element }: ViewInput) =>
        element.classList.add('highlighted'),
      withoutHighlight: ({ element }: ViewInput) =>
        element.classList.remove('highlighted')
    };
  }

  protected next({ model, external }: RenderInput): void {
    if (this.states.positive({ model }) && !external) {
      this.components.children.counterColour[0].paintPositive({
        external: true
      });
      this.components.children.counterValue[0].setValue({
        data: { value: model.counter.value },
        external: true
      });
      this.components.globals.header[0].paintRandom({
        external: true
      });
    }
    if (this.states.negative({ model }) && !external) {
      this.components.children.counterColour[0].paintNegative({
        external: true
      });
      this.components.children.counterValue[0].setValue({
        data: { value: model.counter.value },
        external: true
      });
      this.components.globals.header[0].paintRandom({
        external: true
      });
    }
    if (this.states.neutral({ model }) && !external) {
      this.components.children.counterColour[0].paintNeutral({
        external: true
      });
      this.components.children.counterValue[0].setValue({
        data: { value: model.counter.value },
        external: true
      });
      this.components.globals.header[0].paintRandom({
        external: true
      });
    }
  }
}
