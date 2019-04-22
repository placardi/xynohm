import { RouteDefinitionInterface } from '@placardi/xynohm';
import {
  CountersModule,
  ErrorModule,
  IndividualCounterModule,
  RootModule
} from './modules';
import { CountersResolver, IndividualCounterResolver } from './resolvers';

export const routes: RouteDefinitionInterface[] = [
  {
    name: 'root.counters',
    path: 'counters',
    module: CountersModule,
    resolver: CountersResolver,
    partial: true,
    children: [
      {
        name: 'counter',
        path: '{counterId: [0-9]+}',
        module: IndividualCounterModule,
        resolver: IndividualCounterResolver
      }
    ]
  },
  {
    name: 'root',
    path: '/',
    module: RootModule,
    redirectTo: 'counters'
  },
  {
    name: 'error',
    path: '**',
    module: ErrorModule
  }
];
