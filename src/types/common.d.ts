type Executable = (...args: any[]) => void;

interface Nameable {
  readonly name: string;
}

interface WithElement {
  element(): Element;
}

export { Nameable, Executable, WithElement };
