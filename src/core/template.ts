import { ComponentDefinition } from '../types/component';
import { Configuration } from '../types/configuration';
import { TemplateInterface } from '../types/template';
import {
  ParsedTemplate,
  TemplateParserInterface
} from '../types/template-parser';
import { TemplateParser } from './template-parser';

export class Template implements TemplateInterface {
  private template: HTMLTemplateElement;
  private parser: TemplateParserInterface;

  constructor(template: HTMLTemplateElement) {
    this.template = template;
    this.parser = new TemplateParser();
  }

  public process(
    model: object,
    configuration: Configuration,
    components: ComponentDefinition[]
  ): ParsedTemplate {
    return this.parser.parse(
      this.template.content,
      model,
      configuration,
      components
    );
  }

  public getProperties(): string[] {
    return Object.keys(this.template.dataset).map(key => key.toLowerCase());
  }
}
