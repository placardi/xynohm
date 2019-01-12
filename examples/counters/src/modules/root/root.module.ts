import { ComponentDefinition, Configuration, Module } from '@placardi/xynohm';

export class RootModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: HTMLElement
  ) {
    super(components, configuration, routerOutlet);
  }
}
