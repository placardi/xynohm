import { TemplateParserInterface } from '../types/template-parser';

export class TemplateParser implements TemplateParserInterface {
  private regEx: { [name: string]: RegExp } = {
    moustaches: /{{\s*([\w\.\^ *\/\+\-\(\)\=\?\:\'\"\!\[\]&;]+)?\s*}}/g,
    maths: /(\w+((\.\w+)|(\[\d\]))+)|(\'\w+\')|(\"\w+\")|(\d+)|"(\w+)"|(\w+)|(\+|-|\*|\/|=|>|<|>=|<=|&|\||%|!|\^|\(|\))|\:|\?|\'|\"/g,
    logicalOperators: /(=\s*=\s*=)|(=\s*=)|(!\s*=\s*=)|(!\s*=)|(<\s*=)|(>\s*=)/g
  };

  public parse(content: DocumentFragment, model: object): NodeList {
    const html: string = this.nodesToHTML(
      this.processForDirective(this.processIfDirective(content, model), model)
    );
    const moustaches: string[] = this.parseMoustaches(html, model);
    return this.replaceMoustachesInTemplate(moustaches, html);
  }

  private getMoustaches(html: string): string[] {
    return !this.hasMoustaches(html)
      ? []
      : html.match(this.regEx.moustaches) || [];
  }

  private hasMoustaches(html: string): boolean {
    return html.match(this.regEx.moustaches) !== null;
  }

  private nodesToHTML(nodes: Node[]): string {
    const element: HTMLElement = document.createElement('div');
    while (nodes.length > 0) {
      const nextChild: Node = nodes.shift() as Node;
      element.appendChild(document.importNode(nextChild, true));
    }
    return element.innerHTML;
  }

  private parseMoustaches(html: string, model: object): string[] {
    return this.getMoustaches(html)
      .map(moustache => {
        const expression: string = (moustache
          .slice(2, -2)
          .trim()
          .match(this.regEx.maths) as RegExpMatchArray)
          .map(part => this.evaluateExpressionPart(part, model))
          .join(' ')
          .replace(this.regEx.logicalOperators, match =>
            match.split(' ').join('')
          );
        try {
          return JSON.parse(expression) && expression;
        } catch (e) {
          try {
            return this.isString(expression) ? expression : eval(expression);
          } catch (e) {
            return null;
          }
        }
      })
      .map(moustache => (moustache === null ? 'null' : moustache.toString()));
  }

  private isString(s: any): boolean {
    return s instanceof String || typeof s === 'string';
  }

  private evaluateExpressionPart(part: string, model: any): string {
    if ('__' + part + '__' in model) {
      const value: string = model['__' + part + '__'].shift();
      if (model['__' + part + '__'].length === 0) {
        delete model['__' + part + '__'];
      }
      return value;
    }
    if (part in model) {
      const value: any = model[part];
      return value instanceof Object
        ? JSON.stringify(value, null, 2)
        : value !== undefined && value !== null
        ? value.toString()
        : '{{ ' + part + ' }}';
    }
    if (
      part.indexOf('.') !== -1 ||
      (part.indexOf('[') !== -1 && part.indexOf(']') !== -1)
    ) {
      const value: any = this.evaluateObjectFromPattern(model, part);
      return value instanceof Object
        ? JSON.stringify(value, null, 2)
        : !!value
        ? value
        : 'null';
    }
    return part;
  }

  private replaceMoustachesInTemplate(
    moustaches: string[],
    html: string
  ): NodeList {
    return (
      new DOMParser().parseFromString(
        this.repalceMoustachesInString(moustaches, html),
        'text/html'
      ).body.childNodes || []
    );
  }

  private repalceMoustachesInString(moustaches: string[], str: string): string {
    let index: number = 0;
    return str.replace(this.regEx.moustaches, () => {
      return moustaches[index++];
    });
  }

  private evaluateObjectFromPattern(
    object: { [key: string]: any },
    pattern: string
  ): any {
    return pattern
      .replace(/]/g, '')
      .replace(/\[/g, '.')
      .split('.')
      .reduce(
        (previous, current) => (previous && previous[current]) || undefined,
        object
      );
  }

  private processIfDirective(
    content: DocumentFragment,
    model: object
  ): Element[] {
    return Array.from(content.childNodes as NodeListOf<Element>)
      .map(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('*if')) {
          const attributeValue: string = (node.getAttribute(
            '*if'
          ) as string).trim();
          const moustaches: string[] = this.parseMoustaches(
            attributeValue,
            model
          );
          const expression: string = (this.repalceMoustachesInString(
            moustaches,
            attributeValue
          ).match(this.regEx.maths) as RegExpMatchArray)
            .map(part => this.evaluateExpressionPart(part, model))
            .join(' ')
            .replace(this.regEx.logicalOperators, match =>
              match.split(' ').join()
            );
          if (!eval(expression)) {
            return null;
          }
        }
        return node;
      })
      .filter(Boolean) as Element[];
  }

  private processForDirective(
    nodes: Element[],
    model: { [key: string]: any }
  ): Element[] {
    const processedNodes: Element[] = [];
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('*for')) {
        const attributeValue: string = (node.getAttribute(
          '*for'
        ) as string).trim();
        const moustaches: string[] = this.parseMoustaches(
          attributeValue,
          model
        );
        const {
          iterator,
          iterable
        }: {
          iterator: string;
          iterable: object;
        } = this.getForDirectiveExpression(
          this.repalceMoustachesInString(moustaches, attributeValue),
          model
        );
        if (iterable) {
          model['__' + iterator + '__'] = [];

          const values: any[] | undefined =
            iterable instanceof Array
              ? iterable
              : iterable instanceof Object
              ? Object.values(iterable)
              : Number.isInteger(iterable)
              ? [...Array(iterable).keys()]
              : undefined;
          if (values) {
            values.forEach(value => {
              model['__' + iterator + '__'].push(value);
              processedNodes.push(document.importNode(node, true));
            });
          }
          return;
        }
      }
      if (node.nodeType === Node.TEXT_NODE) {
        const content: string = (node.textContent as string).trim();
        if (content.length === 0) {
          return;
        } else {
          node.textContent = content;
        }
      }
      processedNodes.push(node);
    });
    return processedNodes;
  }

  private getForDirectiveExpression(
    attribute: string,
    model: object
  ): { iterator: string; iterable: object } {
    const expression: string[] = attribute.split(' in ');
    return {
      iterator: expression[0].trim(),
      iterable: this.evaluateIterable(model, expression[1].trim())
    };
  }

  private evaluateIterable(model: object, iterable: string): any {
    return iterable === +iterable + ''
      ? +iterable
      : this.evaluateObjectFromPattern(model, iterable);
  }
}
