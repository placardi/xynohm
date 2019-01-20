import {
  ComponentDefinition,
  Configuration,
  Module,
  RouterOutlet
} from '@placardi/xynohm';

export class CountersModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutlet
  ) {
    super(components, configuration, routerOutlet);
  }
}
