import { Resolver } from '@placardi/xynohm';

export class CountersResolver extends Resolver {
  public resolve(): Promise<object> {
    return Promise.resolve({
      numberOfCounters: 3,
      button: {
        add: 'Add',
        subtract: 'Subtract',
        reset: 'Reset',
        add_counter: 'Add counter',
        remove_counter: 'Remove counter'
      }
    });
  }
}
