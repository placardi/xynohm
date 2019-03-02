import { ComponentDefinition } from './component';
import { Configuration } from './configuration';

interface TemplateParserInterface extends Parseable {}

interface Parseable {
  parse(
    content: DocumentFragment,
    model: object,
    configuration: Configuration,
    components: ComponentDefinition[]
  ): ParsedTemplate;
}

interface ParsedTemplate {
  readonly modelRefs: { [key: string]: object };
  readonly nodes: NodeList;
}

export { ParsedTemplate, TemplateParserInterface };
