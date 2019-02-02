import { Resolver } from '@placardi/xynohm';

export class CountersResolver extends Resolver {
  public resolve(): Promise<object> {
    return Promise.resolve({
      counters: [
        {
          id: 0,
          value: 0
        },
        {
          id: 1,
          value: 1
        },
        {
          id: 2,
          value: -1
        }
      ],
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
