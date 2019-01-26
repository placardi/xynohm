import { TemplateInterface } from './template';

type Executable = (...args: any[]) => void;

interface Nameable {
  readonly name: string;
}

interface WithElement {
  element(): Element;
}

interface Templateable {
  readonly template: TemplateInterface;
}

export { Nameable, Executable, WithElement, Templateable };
