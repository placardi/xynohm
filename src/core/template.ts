import { TemplateInterface } from '../types/template';
import { TemplateParserInterface } from '../types/template-parser';
import { TemplateParser } from './template-parser';

export class Template implements TemplateInterface {
  private template: HTMLTemplateElement;
  private parser: TemplateParserInterface;

  constructor(template: HTMLTemplateElement) {
    this.template = template;
    this.parser = new TemplateParser();
  }

  public process(model: object): NodeList {
    return this.parser.parse(this.template.content, model);
  }
}
