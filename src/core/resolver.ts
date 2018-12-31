import { ResolverIntrface } from '../types/resolver';

export class Resolver implements ResolverIntrface {
  public get name(): string {
    return this.constructor.name;
  }

  public resolve(): Promise<object> {
    return Promise.resolve({});
  }

  protected resolveInParallel(tasks: Array<() => Promise<any>>): Promise<any> {
    return Promise.all(tasks.map(task => task()));
  }

  protected resolveInSeries(tasks: Array<() => Promise<any>>): Promise<any> {
    return tasks.reduce(
      (previous: Promise<any>, current: () => Promise<any>) => {
        return previous.then(results => {
          return current().then(result => results.concat(result));
        });
      },
      Promise.resolve([])
    );
  }
}
