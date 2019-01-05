import {
  Actions,
  Component,
  Model,
  ModuleIntrface,
  States,
  Views
} from '@placardi/xynohm';
import { CounterComponent } from '../counter/counter.component';

export class CountersComponent extends Component {
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

  protected representation(model: Model): void {
    if (this.states.add(model)) {
      this.views.add(model, this.element);
    }
    if (this.states.remove(model)) {
      this.views.remove(model, this.element);
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      add: (model: Model) => !!model.transient.add,
      remove: (model: Model) => !!model.transient.remove
    };
  }

  protected get views(): Views {
    return {
      add: (_model: Model, element: HTMLElement) => {
        element.appendChild(
          this.module.mount(CounterComponent, {
            id: this.components.children.counter
              ? this.components.children.counter.length
              : 0,
            value: 0
          })
        );
      },
      remove: (_model: Model, element: HTMLElement) => {
        if (element.children.length > 0) {
          this.module.unmount(
            (element.lastElementChild as HTMLElement).getAttribute(
              'elementID'
            ) as string
          );
        }
      }
    };
  }
}
