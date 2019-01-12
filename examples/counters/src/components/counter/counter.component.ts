import {
  Actions,
  Component,
  Model,
  ModuleIntrface,
  States
} from '@placardi/xynohm';

export class CounterComponent extends Component {
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
      add: (data?: any, external?: boolean) =>
        this.present({ increment: data.increment || 1 }, external),
      subtract: (data?: any, external?: boolean) =>
        this.present({ decrement: data.decrement || 1 }, external),
      reset: (data?: any, external?: boolean) =>
        this.present({ value: data.value || 0 }, external)
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
    this.states.render(this.model, external);
  }

  protected get states(): States {
    return {
      ...super.states,
      positive: (model: Model) => model.value > 0,
      negative: (model: Model) => model.value < 0,
      neutral: (model: Model) => model.value === 0
    };
  }

  protected next(model: Model, external?: boolean): void {
    if (this.states.positive(model) && !external) {
      this.components.children.counterColour[0].paintPositive(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
    }
    if (this.states.negative(model) && !external) {
      this.components.children.counterColour[0].paintNegative(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
    }
    if (this.states.neutral(model) && !external) {
      this.components.children.counterColour[0].paintNeutral(null, true);
      this.components.children.counterValue[0].setValue(
        { value: model.value },
        true
      );
    }
  }
}
