import {
  ComponentDefinition,
  Configuration,
  Module,
  RouterOutlet
} from '@placardi/xynohm';

export class RootModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutlet
  ) {
    super(components, configuration, routerOutlet);
  }
}
