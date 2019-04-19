import {
  ComponentDefinition,
  Configuration,
  Module,
  RouterOutletInterface
} from '@placardi/xynohm';

export class RootModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ) {
    super(components, configuration, routerOutlet);
  }
}
