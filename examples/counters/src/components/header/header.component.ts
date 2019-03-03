import {
  ActionInput,
  Actions,
  Component,
  Model,
  OnInit,
  PresentInput,
  StateInput,
  States,
  ViewInput,
  Views
} from '@placardi/xynohm';
export class HeaderComponent extends Component implements OnInit {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public onInit(): void {}

  public get actions(): Actions {
    return {
      paintRandom: ({ external }: ActionInput) =>
        this.present({ data: { paintRandom: true }, external })
    };
  }

  protected present({ data, external }: PresentInput): void {
    if ('paintRandom' in data) {
      this.model.transient.colour = `#${Math.floor(Math.random() * 0x1000000)
        .toString(16)
        .padStart(6)}`;
    }
    this.states.render({ model: this.model, external });
  }

  protected representation(model: Model): void {
    if (this.states.colourful({ model })) {
      this.views.colourful({ model, element: this.element });
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      colourful: ({ model }: StateInput) => !!model.transient.colour
    };
  }

  protected get views(): Views {
    return {
      colourful: ({ model, element }: ViewInput) => {
        element.style.background = model.transient.colour;
      }
    };
  }
}
