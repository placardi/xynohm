import { Resolver } from '@placardi/xynohm';

export class IndividualCounterResolver extends Resolver {
  public resolve(data: any): Promise<object> {
    return Promise.resolve({
      counter: {
        id: data.counterId || 0,
        value: Math.floor(21 * Math.random() - 10)
      },
      buttons: {
        add: 'Add',
        subtract: 'Subtract',
        reset: 'Reset',
        add_counter: 'Add counter',
        remove_counter: 'Remove counter'
      }
    });
  }
}
