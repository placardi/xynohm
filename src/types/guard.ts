export interface GuardDefinition extends Chainable {
  new (): GuardInterface;
}

interface Chainable {
  chain(guard: GuardDefinition): GuardInterface;
}

export interface GuardInterface {
  check(): Promise<object>;
}
