import { ComponentDefinition } from './component';
import { Configuration } from './configuration';
import { ParsedTemplate } from './template-parser';

interface TemplateInterface extends Processable {
  getProperties(): string[];
}

interface Processable {
  process(
    model: object,
    configuration: Configuration,
    components: ComponentDefinition[]
  ): ParsedTemplate;
}

export { TemplateInterface };
