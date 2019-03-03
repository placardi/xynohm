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
import { CounterComponent } from '../counter/counter.component';

export class CountersComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      add: ({ external }: ActionInput) =>
        this.present({ data: { add: true }, external }),
      remove: ({ external }: ActionInput) =>
        this.present({ data: { remove: true }, external }),
      addHighlight: ({ event }: ActionInput) => {
        const target: HTMLElement | undefined =
          event && (event.target as HTMLElement);
        if (target) {
          const index: number = Array.from(
            (target.parentNode as HTMLElement).children
          ).indexOf(target);
          this.components.children.counter[index].addHighlight({
            external: true
          });
        }
      },
      removeHighlight: ({ event }: ActionInput) => {
        const target: HTMLElement | undefined =
          event && (event.target as HTMLElement);
        if (target) {
          const index: number = Array.from(
            (target.parentNode as HTMLElement).children
          ).indexOf(target);
          this.components.children.counter[index].removeHighlight({
            external: true
          });
        }
      },
      observe: ({ event }: ActionInput) => {
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

  protected present({ data, external }: PresentInput): void {
    if ('add' in data) {
      this.model.transient.add = true;
    }
    if ('remove' in data) {
      this.model.transient.remove = true;
    }
    this.states.render({ model: this.model, external });
  }

  protected representation(model: Model): void {
    if (this.states.add({ model })) {
      this.views.add({ model, element: this.element });
    }
    if (this.states.remove({ model })) {
      this.views.remove({ model, element: this.element });
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      add: ({ model }: StateInput) => !!model.transient.add,
      remove: ({ model }: StateInput) => !!model.transient.remove
    };
  }

  protected get views(): Views {
    return {
      add: ({ model, element }: ViewInput) => {
        element.appendChild(
          this.mounter.mountComponent(
            CounterComponent,
            {
              counter: {
                id: this.components.children.counter
                  ? this.components.children.counter.length
                  : 0,
                value: Math.floor(21 * Math.random() - 10)
              },
              buttons: model.buttons
            },
            {
              _mouseenter: 'Counters.addHighlight()',
              _mouseleave: 'Counters.removeHighlight()',
              '_custom-event': 'Counters.observe()'
            }
          )
        );
      },
      remove: ({ element }: ViewInput) => {
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
