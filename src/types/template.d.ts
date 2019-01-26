interface TemplateInterface extends Processable {
  getProperties(): string[];
}

interface Processable {
  process(model: object): NodeList;
}

export { TemplateInterface };
