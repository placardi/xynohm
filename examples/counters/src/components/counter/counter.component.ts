import { Actions, Component, Model, States, Views } from '@placardi/xynohm';

export class CounterComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      add: (data?: any, external?: boolean) =>
        this.present({ increment: data.increment || 1 }, external),
      subtract: (data?: any, external?: boolean) =>
        this.present({ decrement: data.decrement || 1 }, external),
      reset: (data?: any, external?: boolean) =>
        this.present({ value: data.value || 0 }, external),
      addHighlight: (_data?: any, external?: boolean) =>
        this.present({ highlight: true }, external),
      removeHighlight: (_data?: any, external?: boolean) =>
        this.present({ highlight: false }, external)
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('increment' in data) {
      this.model.value += data.increment;
    }
    if ('decrement' in data) {
      this.model.value -= data.decrement;
    }
    if ('value' in data) {
      this.model.value = data.value;
    }
    if ('highlight' in data) {
      this.model.highlight = data.highlight;
    }
    if ('increment' in data || 'decrement' in data || 'value' in data) {
      this.element.dispatchEvent(
        new CustomEvent('custom-event', {
          detail: {
            uuid: this.uuid,
            value: this.model.value
          }
        })
      );
    }
    this.states.render(this.model, external);
  }

  protected get states(): States {
    return {
      ...super.states,
      positive: (model: Model) => model.value > 0,
      negative: (model: Model) => model.value < 0,
      neutral: (model: Model) => model.value === 0,
      withHighlight: (model: Model) => !!model.highlight,
      withoutHighlight: (model: Model) => !model.highlight
    };
  }

  protected representation(model: Model): void {
    if (this.states.withHighlight(model)) {
      this.views.withHighlight(model, this.element);
    }
    if (this.states.withoutHighlight(model)) {
      this.views.withoutHighlight(model, this.element);
    }
  }

  protected get views(): Views {
    return {
      withHighlight: (_model: Model, element: HTMLElement) =>
        element.classList.add('highlighted'),
      withoutHighlight: (_model: Model, element: HTMLElement) =>
        element.classList.remove('highlighted')
    };
  }

  protected next(model: Model, external?: boolean): void {
    if (this.states.positive(model) && !external) {
      this.components.children.counterColour[0].paintPositive(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
      this.components.globals.header[0].paintRandom(null, true);
    }
    if (this.states.negative(model) && !external) {
      this.components.children.counterColour[0].paintNegative(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
      this.components.globals.header[0].paintRandom(null, true);
    }
    if (this.states.neutral(model) && !external) {
      this.components.children.counterColour[0].paintNeutral(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
      this.components.globals.header[0].paintRandom(null, true);
    }
  }
}
