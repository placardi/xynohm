import { ComponentDefinition, ComponentInterface } from '../types/component';
import { ModuleDefinitionInput, ModuleInterface } from '../types/module';
import { RouterOutletInterface } from '../types/router-outlet';
import { Mounter } from './mounter';
import { Template } from './template';

export class Module implements ModuleInterface {
  private components: ComponentDefinition[];
  private routerOutlet: RouterOutletInterface;
  private mounter: Mounter;

  constructor({
    components,
    router,
    routerOutlet,
    configuration
  }: ModuleDefinitionInput) {
    this.components = components;
    this.routerOutlet = routerOutlet;
    this.mounter = new Mounter(
      this.routerOutlet,
      configuration,
      this.components,
      router
    );
  }

  public render(
    data: object,
    components: ComponentInterface[],
    path: string
  ): HTMLElement {
    const model: object = data instanceof Object ? data : {};
    const { modelRefs, nodes } = this.template.process(
      model,
      this.routerOutlet.getAppRoot().getConfiguration(),
      this.components
    );
    this.mounter.mountComponents(
      components,
      nodes,
      { ...model, ...modelRefs },
      path
    );
    return this.mounter.getMountedElement();
  }

  public getMountedComponents(path: string): ComponentInterface[] {
    return this.mounter.getMountedComponents(path);
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
