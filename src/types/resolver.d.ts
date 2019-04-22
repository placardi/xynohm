import { Nameable } from './common';

interface ResolverIntrface extends Nameable, Resolvable {}

interface Resolvable {
  resolve(data: any): Promise<object>;
}

type ResolverDefinition = new () => ResolverIntrface;

export { ResolverIntrface, ResolverDefinition };
