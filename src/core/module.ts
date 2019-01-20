import { ComponentDefinition, ComponentInterface } from '../types/component';
import { Configuration } from '../types/configuration';
import { ModuleInterface } from '../types/module';
import { Mounter } from './mounter';
import { RouterOutlet } from './router-outlet';
import { Template } from './template';

export class Module implements ModuleInterface {
  private routerOutlet: RouterOutlet;
  private mounter: Mounter;

  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutlet
  ) {
    this.routerOutlet = routerOutlet;
    this.mounter = new Mounter(this.routerOutlet, configuration, components);
  }

  public render(data: object, components: ComponentInterface[]): HTMLElement {
    const model: object = data instanceof Object ? data : {};
    this.mounter.mountComponents(
      components,
      this.template().process(model),
      model
    );
    return this.mounter.getMountedElement();
  }

  public get name(): string {
    return this.constructor.name;
  }

  private template(): Template {
    return new Template(
      document.querySelector('template[module="' + this.name + '"]') ||
        document.createElement('template')
    );
  }
}
