import {
  ComponentDefinition,
  Configuration,
  Module,
  RouterOutletInterface
} from '@placardi/xynohm';

export class ErrorModule extends Module {
  constructor(
    components: ComponentDefinition[],
    configuration: Configuration,
    routerOutlet: RouterOutletInterface
  ) {
    super(components, configuration, routerOutlet);
  }
}
