import { Actions, Component, Model, States, Views } from '@placardi/xynohm';
import { CounterComponent } from '../counter/counter.component';

export class CountersComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      add: (_data?: any, external?: boolean) =>
        this.present({ add: true }, external),
      remove: (_data?: any, external?: boolean) =>
        this.present({ remove: true }, external),
      addHighlight: (_data?: any, _external?: boolean, event?: Event) => {
        const target: HTMLElement | undefined =
          event && (event.target as HTMLElement);
        if (target) {
          const index: number = Array.from(
            (target.parentNode as HTMLElement).children
          ).indexOf(target);
          this.components.children.counter[index].addHighlight(null, true);
        }
      },
      removeHighlight: (_data?: any, _external?: boolean, event?: Event) => {
        const target: HTMLElement | undefined =
          event && (event.target as HTMLElement);
        if (target) {
          const index: number = Array.from(
            (target.parentNode as HTMLElement).children
          ).indexOf(target);
          this.components.children.counter[index].removeHighlight(null, true);
        }
      },
      observe: (_data?: any, _external?: boolean, event?: Event) => {
        if (event) {
          alert(
            `Component with UUID ${
              (event as CustomEvent).detail.uuid
            } has a value of ${(event as CustomEvent).detail.value}`
          );
        }
      }
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
          this.mounter.mountComponent(
            CounterComponent,
            {
              id: this.components.children.counter
                ? this.components.children.counter.length
                : 0,
              value: 0
            },
            {
              _mouseenter: 'Counters.addHighlight()',
              _mouseleave: 'Counters.removeHighlight()',
              '_custom-event': 'Counters.observe()'
            }
          )
        );
      },
      remove: (_model: Model, element: HTMLElement) => {
        if (element.children.length > 0) {
          this.mounter.unmountComponent(
            (element.lastElementChild as HTMLElement).getAttribute(
              'elementID'
            ) as string
          );
        }
      }
    };
  }
}
