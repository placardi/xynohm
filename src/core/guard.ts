import { GuardDefinition, GuardInterface } from '../types/guard';

export class Guard implements GuardInterface {
  public static chain(guard: GuardDefinition): GuardInterface {
    return new guard();
  }

  public check(): Promise<object> {
    return Promise.resolve({});
  }
}
