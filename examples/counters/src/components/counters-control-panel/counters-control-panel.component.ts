import {
  ActionInput,
  Actions,
  Component,
  Model,
  PresentInput,
  RenderInput,
  StateInput,
  States
} from '@placardi/xynohm';

export class CountersControlPanelComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      add: ({ external }: ActionInput) =>
        this.present({ data: { add: true }, external }),
      remove: ({ external }: ActionInput) =>
        this.present({ data: { remove: true }, external })
    };
  }

  protected present({ data, external }: PresentInput): void {
    if ('add' in data) {
      this.model.transient.add = true;
    }
    if ('remove' in data) {
      this.model.transient.remove = true;
    }
    this.states.render({ model: this.model, external });
  }

  protected get states(): States {
    return {
      ...super.states,
      add: ({ model }: StateInput) => !!model.transient.add,
      remove: ({ model }: StateInput) => !!model.transient.remove
    };
  }

  protected next({ model, external }: RenderInput): void {
    if (this.states.add({ model }) && !external) {
      this.components.siblings.counters[0].add({ external: true });
    }
    if (this.states.remove({ model }) && !external) {
      this.components.siblings.counters[0].remove({ external: true });
    }
  }
}
