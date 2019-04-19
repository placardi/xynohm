import { ComponentDefinition, ComponentInterface } from '../types/component';
import { Configuration } from '../types/configuration';
import { ModuleInterface } from '../types/module';
import { RouterOutletInterface } from '../types/router-outlet';
import { Mounter } from './mounter';
import { Template } from './template';

export class Module implements ModuleInterface {
  private components: ComponentDefinition[];
  private routerOutlet: RouterOutletInterface;
  private mounter: Mounter;

  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ) {
    this.components = components;
    this.routerOutlet = routerOutlet;
    this.mounter = new Mounter(
      this.routerOutlet,
      configuration,
      this.components
    );
  }

  public render(data: object, components: ComponentInterface[]): HTMLElement {
    const model: object = data instanceof Object ? data : {};
    const { modelRefs, nodes } = this.template.process(
      model,
      this.routerOutlet.getAppRoot().getConfiguration(),
      this.components
    );
    this.mounter.mountComponents(components, nodes, { ...model, ...modelRefs });
    return this.mounter.getMountedElement();
  }

  public getMountedComponents(): ComponentInterface[] {
    return this.mounter.getMountedComponents();
  }

  public assignDependencies(components: ComponentInterface[]): void {
    this.mounter.assignDependencies(components);
  }

  public get name(): string {
    return this.constructor.name;
  }

  public get template(): Template {
    return new Template(
      document.querySelector('template[module="' + this.name + '"]') ||
        document.createElement('template')
    );
  }
}
