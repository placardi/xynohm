interface TemplateParserInterface extends Parseable {}

interface Parseable {
  parse(content: DocumentFragment, model: object): NodeList;
}

export { TemplateParserInterface };
