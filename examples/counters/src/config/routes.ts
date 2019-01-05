import { RouteDefinitionInterface } from '@placardi/xynohm';
import { CountersModule, ErrorModule, RootModule } from './modules';
import { CountersResolver } from './resolvers';

export const routes: RouteDefinitionInterface[] = [
  {
    name: 'root',
    path: '/',
    module: RootModule
  },
  {
    name: 'root.counters',
    path: '/counters',
    module: CountersModule,
    resolver: CountersResolver
  },
  {
    name: 'error',
    path: '**',
    module: ErrorModule
  }
];
