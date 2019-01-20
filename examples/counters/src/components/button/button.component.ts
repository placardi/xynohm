import { Actions, Component, Model, States, Views } from '@placardi/xynohm';

export class ButtonComponent extends Component {
  constructor(model: Model, uuid: string, element: HTMLElement) {
    super(model, uuid, element);
  }

  public get actions(): Actions {
    return {
      fetch: (_data?: any, external?: boolean) => {
        this.present({ fetching: true }, external);
        fetch('https://randomuser.me/api/')
          .then(response => response.json())
          .then(json => this.present(json.results[0], external));
      }
    };
  }

  protected present(data: any, external?: boolean): void {
    if ('fetching' in data) {
      this.model.transient.fetching = true;
    }
    if ('login' in data && 'uuid' in data.login) {
      this.model.uuid = data.login.uuid;
      this.model.transient.uuid = this.model.uuid;
    }
    this.states.render(this.model, external);
  }

  protected representation(model: Model): void {
    if (this.states.uuidChanged(model)) {
      this.views.uuidChanged(model, this.element);
    }
    if (this.states.fetching(model)) {
      this.views.fetching(model, this.element);
    }
  }

  protected get states(): States {
    return {
      ...super.states,
      fetching: (model: Model) => !!model.transient.fetching,
      uuidChanged: (model: Model) => !!model.transient.uuid
    };
  }

  protected get views(): Views {
    return {
      uuidChanged: (model: Model, element: HTMLElement) => {
        element.removeAttribute('disabled');
        (element.querySelector('.button-text') as HTMLElement).classList.remove(
          'hidden'
        );
        (element.querySelector('.loader') as HTMLElement).classList.add(
          'hidden'
        );
        setTimeout(() => alert('New UUID: ' + model.uuid), 1);
      },
      fetching: (_model: Model, element: HTMLElement) => {
        element.setAttribute('disabled', '');
        (element.querySelector('.button-text') as HTMLElement).classList.add(
          'hidden'
        );
        (element.querySelector('.loader') as HTMLElement).classList.remove(
          'hidden'
        );
      }
    };
  }
}
