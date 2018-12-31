interface TemplateInterface extends Processable {}

interface Processable {
  process(model: object): NodeList;
}

export { TemplateInterface };
