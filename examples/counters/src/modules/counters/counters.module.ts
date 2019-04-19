import {
  ComponentDefinition,
  Configuration,
  Module,
  RouterOutletInterface
} from '@placardi/xynohm';

export class CountersModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ) {
    super(components, configuration, routerOutlet);
  }
}
