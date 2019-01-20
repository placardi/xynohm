import { Actions, Component, Model, States, Views } from '@placardi/xynohm';

export class HeaderComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      paintRandom: (_data?: any, external?: boolean) =>
        this.present({ paintRandom: true }, external)
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('paintRandom' in data) {
      this.model.transient.colour = `#${Math.floor(Math.random() * 0x1000000)
        .toString(16)
        .padStart(6)}`;
    }
    this.states.render(this.model, external);
  }

  protected representation(model: Model): void {
    if (this.states.colourful(model)) {
      this.views.colourful(model, this.element);
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      colourful: (model: Model) => !!model.transient.colour
    };
  }

  protected get views(): Views {
    return {
      colourful: (model: Model, element: HTMLElement) => {
        element.style.background = model.transient.colour;
      }
    };
  }
}
