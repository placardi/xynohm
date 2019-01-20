import { Actions, Component, Model, States } from '@placardi/xynohm';

export class CountersControlPanelComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      add: (_data?: any, external?: boolean) =>
        this.present({ add: true }, external),
      remove: (_data?: any, external?: boolean) =>
        this.present({ remove: true }, external)
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('add' in data) {
      this.model.transient.add = true;
    }
    if ('remove' in data) {
      this.model.transient.remove = true;
    }
    this.states.render(this.model, external);
  }

  protected get states(): States {
    return {
      ...super.states,
      add: (model: Model) => !!model.transient.add,
      remove: (model: Model) => !!model.transient.remove
    };
  }

  protected next(model: Model, external?: boolean): void {
    if (this.states.add(model) && !external) {
      this.components.siblings.counters[0].add(null, true);
    }
    if (this.states.remove(model) && !external) {
      this.components.siblings.counters[0].remove(null, true);
    }
  }
}
