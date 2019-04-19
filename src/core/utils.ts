import { ComponentDefinition, ComponentInterface } from '../types/component';

export const lcfirst: (str: string) => string = (str: string) =>
  str.charAt(0).toLowerCase() + str.slice(1);

export const ucfirst: (str: string) => string = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const camelCaseToDash: (str: string) => string = (str: string) =>
  str
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([0-9])([^0-9])/g, '$1-$2')
    .replace(/([^0-9])([0-9])/g, '$1-$2')
    .replace(/-+/g, '-')
    .toLowerCase();

export const dashToCamelCase: (str: string) => string = (str: string) =>
  str.toLowerCase().replace(/-(.)/g, m => m[1].toUpperCase());

export const evaluateObjectFromPattern: (
  object: { [key: string]: any },
  pattern: string
) => any = (object: { [key: string]: any }, pattern: string) => {
  const brackets: RegExpMatchArray | null = pattern.match(
    /\[((\.?\w+(\[[\"\']?\w+[\"\']?\])*(\[.+\])*)*)\]/g
  );
  if (!!brackets) {
    const parsedBrackets: Array<{
      original: string;
      parsed: string;
    }> = brackets
      .map(item => ({
        original: item,
        parsed: item.slice(1, -1)
      }))
      .filter(({ parsed }) => isNaN(Number(parsed)))
      .map(({ original, parsed }) => ({
        original,
        parsed: evaluateObjectFromPattern(object, parsed)
      }));
    if (
      parsedBrackets.find(
        ({ parsed }) =>
          typeof parsed === 'boolean' ||
          parsed === null ||
          parsed === undefined ||
          (parsed as any) instanceof Array ||
          (parsed as any) instanceof Object
      )
    ) {
      return undefined;
    } else {
      parsedBrackets.forEach(({ original, parsed }) => {
        pattern = pattern.replace(original, `['${parsed}']`);
      });
    }
  }
  return pattern
    .replace(/[\'\"]?\]/g, '')
    .replace(/\[[\'\"]?/g, '.')
    .split('.')
    .reduce((previous, current) => previous && previous[current], object);
};

export const generateUUID: () => string = () => {
  let d = new Date().getTime();
  if (
    typeof performance !== 'undefined' &&
    typeof performance.now === 'function'
  ) {
    d += performance.now();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const getComponentName: (
  component: ComponentDefinition | ComponentInterface,
  removePostfix?: boolean
) => string = (
  component: ComponentDefinition | ComponentInterface,
  removePostfix?: boolean
) =>
  !removePostfix ? component.name : component.name.replace('Component', '');

export const isCustomElement: (
  node: Node,
  tagPrefix: string,
  components: ComponentDefinition[]
) => boolean = (
  node: Node,
  tagPrefix: string,
  components: ComponentDefinition[]
) => {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName: string = (node as Element).tagName.toLowerCase();
    const componentName: string = dashToCamelCase(
      tagName.replace(tagPrefix.toLowerCase() + '-', '')
    );
    const componentNames: string[] = components.map(component =>
      lcfirst(getComponentName(component, true))
    );
    return (
      new RegExp('^/{0,1}' + tagPrefix.toLowerCase() + '(-\\w+)+$', 'gi').test(
        tagName
      ) && componentNames.indexOf(componentName) !== -1
    );
  }
  return false;
};

export const isString: (s: any) => boolean = (s: any) =>
  s instanceof String || typeof s === 'string';

export const convertDataType: (data: string) => any = (data: string) => {
  const hasBracesRegEx: RegExp = /^(^\s*\{\s*[A-Z0-9._]+\s*:\s*[A-Z0-9._]+\s*(,\s*[A-Z0-9._]+\s*:\s*[A-Z0-9._]+\s*)*\}\s*$|\[[\w\W]*\])$/;
  if (data.length === 0) {
    return '';
  }
  if (data === 'true') {
    return true;
  }
  if (data === 'false') {
    return false;
  }
  if (data === 'null') {
    return null;
  }
  if (data === 'undefined') {
    return undefined;
  }
  if (data === +data + '') {
    return +data;
  }
  if (hasBracesRegEx.test(data)) {
    return JSON.parse(data.replace(new RegExp('(\\\\)', 'g'), ''));
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return data.replace(/['"]+/g, '');
  }
};
