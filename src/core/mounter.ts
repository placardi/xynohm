import { WithElement } from '../types/common';
import {
  Actionable,
  ComponentDefinition,
  ComponentInterface
} from '../types/component';
import { Configuration } from '../types/configuration';
import { MounterInterface } from '../types/mounter';

export class Mounter implements MounterInterface {
  private addData: object;
  private content: WithElement;
  private configuration: Configuration;
  private components: ComponentDefinition[];
  private mountedElement: HTMLElement;
  private mountedComponents: ComponentInterface[];
  private componentsLoadedEvent: CustomEvent;

  constructor(
    content: WithElement,
    configuration: Configuration,
    components: ComponentDefinition[]
  ) {
    this.addData = {};
    this.content = content;
    this.mountedComponents = [];
    this.components = components;
    this.configuration = configuration;
    this.componentsLoadedEvent = new CustomEvent('__components_loaded__');
  }

  public mountComponent(
    component: ComponentDefinition,
    data: object
  ): HTMLElement {
    return this._mountComponent(component, data);
  }

  public unmountComponent(elementID: string): void {
    const componentToRemove:
      | ComponentInterface
      | undefined = this.mountedComponents.find(
      component => component.uuid === elementID
    );
    if (componentToRemove) {
      const index: number = this.mountedComponents.indexOf(componentToRemove);
      this.mountedComponents.splice(index, 1);
      (componentToRemove.element.parentNode as HTMLElement).removeChild(
        componentToRemove.element
      );
      this.assignDependencies();
    }
  }

  public mountComponents(
    mountedComponents: ComponentInterface[],
    nodes: NodeList,
    data: object
  ): ComponentInterface[] {
    const sourceElement: Element = this.content.element();
    this.addData = { ...this.addData, ...data };
    this.mountedElement = this._mountComponents(
      Array.from(nodes).reduce((element: HTMLElement, node: Node) => {
        if (this.isCustomElement(node)) {
          this.markElementAsComponent(node as HTMLElement);
        }
        element.appendChild(node);
        return element;
      }, document.createElement(sourceElement.tagName.toLowerCase()))
    );
    (sourceElement.parentNode as Node).replaceChild(
      this.mountedElement,
      sourceElement
    );
    this.mountedComponents = this.mountedComponents.concat(mountedComponents);
    this.assignDependencies();
    this.mountedComponents.forEach(component =>
      component.element.dispatchEvent(this.componentsLoadedEvent)
    );
    return this.mountedComponents;
  }

  public getMountedComponents(): ComponentInterface[] {
    return this.mountedComponents;
  }

  public getMountedElement(): HTMLElement {
    return this.mountedElement;
  }

  public _mountComponent(
    component: ComponentDefinition,
    properties: object,
    events?: Attr[],
    internal?: boolean
  ): HTMLElement {
    const model = { ...this.addData, ...properties };
    const tagName: string =
      this.configuration.tagPrefix +
      '-' +
      this.camelCaseToDash(this.getComponentName(component, true));
    const element: HTMLElement = this.createElement(
      tagName,
      component.template.process(model)
    );
    const uuid: string = this.generateUUID();
    this.markElementAsProcessed(element, uuid, events);
    const instance: ComponentInterface = new component(model, uuid, element);
    instance.setMounter(this);
    this.bindEvents(element, instance);
    this.mountedComponents.push(instance);
    if (!internal) {
      this.markElementsAsComponents(instance.element);
      this._mountComponents(instance.element);
      const mutationObserver: MutationObserver = new MutationObserver(
        (mutations: MutationRecord[], observer: MutationObserver) => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              this.assignDependencies();
              instance.element.dispatchEvent(this.componentsLoadedEvent);
            }
          });
          observer.disconnect();
        }
      );
      mutationObserver.observe(this.content.element(), {
        childList: true,
        attributes: true,
        subtree: true
      });
    }
    return element;
  }

  private isCustomElement(node: Node): boolean {
    return (
      node.nodeType === Node.ELEMENT_NODE &&
      new RegExp(
        '/*' + this.configuration.tagPrefix.toLowerCase() + '(-\\w+)+',
        'g'
      ).test((node as Element).tagName.toLowerCase())
    );
  }

  private markElementAsComponent(element: Element): Element {
    element.setAttribute('component', '');
    return element;
  }

  private _mountComponents(content: HTMLElement): HTMLElement {
    let element: HTMLElement | null = this.getNextUnprocessedElement(content);
    while (element) {
      const elementTag = element.tagName.toLowerCase();
      const componentName =
        this.ucfirst(
          this.dashToCamelCase(
            elementTag.replace(this.configuration.tagPrefix + '-', '')
          )
        ) + 'Component';
      const componentIndex = this.components
        .map(component => this.getComponentName(component).toLowerCase())
        .indexOf(componentName.toLowerCase());
      if (componentIndex === -1) {
        throw new Error(`Component for '${elementTag}' tag is not defined`);
      }
      const mountedElement: HTMLElement = this._mountComponent(
        this.components[componentIndex],
        this.unwrapDataset(element.dataset),
        this.getEvents(element.attributes),
        true
      );
      this.markElementsAsComponents(mountedElement);
      if (mountedElement) {
        (element.parentNode as Node).replaceChild(mountedElement, element);
        element = this.getNextUnprocessedElement(content);
      }
    }
    return content;
  }

  private getNextUnprocessedElement(content: Element): HTMLElement | null {
    return content.querySelector('*[component]:not([processed])');
  }

  private generateUUID(): string {
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
  }

  private markElementsAsComponents(content: Element): void {
    content.querySelectorAll('*').forEach(element => {
      if (this.isCustomElement(element)) {
        this.markElementAsComponent(element);
      }
    });
  }

  private markElementAsProcessed(
    element: Element,
    uuid?: string,
    events?: Attr[]
  ) {
    element.setAttribute('processed', '');
    if (uuid) {
      element.setAttribute('elementID', uuid);
    }
    if (events) {
      events.forEach(event => element.setAttribute(event.name, event.value));
    }
    return element;
  }

  private lcfirst(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private ucfirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private camelCaseToDash(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/([0-9])([^0-9])/g, '$1-$2')
      .replace(/([^0-9])([0-9])/g, '$1-$2')
      .replace(/-+/g, '-')
      .toLowerCase();
  }

  private dashToCamelCase(str: string): string {
    return str.toLowerCase().replace(/-(.)/g, m => m[1].toUpperCase());
  }

  private getComponentName(
    component: ComponentDefinition | ComponentInterface,
    removePostfix?: boolean
  ): string {
    return !removePostfix
      ? component.name
      : component.name.replace('Component', '');
  }

  private unwrapDataset(dataset: DOMStringMap): object {
    return Object.entries(dataset)
      .filter(([_key, value]) => !!value)
      .map(([_key, value]) => [_key, this.convertDataType(value as string)])
      .reduce((obj: object, [k, v]) => ({ ...obj, [k]: v }), {});
  }

  private convertDataType(data: string): any {
    const hasBracesRegEx: RegExp = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;
    if (data.length === 0) {
      return undefined;
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
    return data.replace(/['"]+/g, '');
  }

  private createElement(tag: string, nodes: NodeList): HTMLElement {
    const element: HTMLElement = document.createElement(tag);
    const nodesArray: any[] = Array.prototype.slice.call(nodes);
    element.setAttribute('component', '');
    while (nodesArray.length > 0) {
      element.appendChild(nodesArray.shift());
    }
    return element;
  }

  private getEvents(attributes: NamedNodeMap): Attr[] {
    return Array.from(attributes).filter(
      attribute => attribute.name[0] === '_'
    );
  }

  private bindEvents(element: Element, instance: ComponentInterface): Element {
    element
      .querySelectorAll('*')
      .forEach(child =>
        this.getEvents(child.attributes).forEach(event =>
          this.bindEvent(event, instance, child)
        )
      );
    this.getEvents(element.attributes).forEach(event =>
      this.bindEvent(event, instance, element)
    );
    return element;
  }

  private bindEvent(
    event: Attr,
    instance: ComponentInterface,
    element: Element
  ): void {
    const actions = instance.actions;
    const eventType: string = event.name.substr(1);
    const eventName: string = event.value;
    const argumentsIndex: number = eventName.indexOf('(');
    const actionName: string =
      argumentsIndex !== -1 ? eventName.substr(0, argumentsIndex) : eventName;
    const actionNameParts: string[] = actionName.split('.');
    const actionArguments: number =
      argumentsIndex !== -1
        ? this.convertDataType(eventName.slice(argumentsIndex + 1, -1))
        : undefined;
    if (actionNameParts.length > 1) {
      const method: string = actionNameParts[1];
      if (method in actions) {
        element.removeEventListener(eventType, actions[method]);
        element.addEventListener(
          eventType,
          actions[method].bind(instance, actionArguments, undefined)
        );
      }
    } else {
      throw new Error(
        "Attempting to call '" + actionName + "' of an undefined component"
      );
    }
  }

  private assignDependencies(): void {
    this.mountedComponents.forEach(component => {
      const parents: ComponentInterface[] = this.getComponentParents(
        component,
        this.mountedComponents
      );
      const children: ComponentInterface[] = this.getComponentChildren(
        component,
        this.mountedComponents
      );
      const siblings: ComponentInterface[] = this.getComponentSiblings(
        component,
        this.mountedComponents
      );
      const globals: ComponentInterface[] = this.getComponentGlobals(
        component,
        this.mountedComponents,
        parents,
        children,
        siblings
      );
      component.setDependencies({
        parents: this.groupByComponentName(parents),
        children: this.groupByComponentName(children),
        siblings: this.groupByComponentName(siblings),
        globals: this.groupByComponentName(globals)
      });
    });
  }

  private groupByComponentName(components: ComponentInterface[]): Actionable {
    return components.reduce((acc: Actionable, obj: ComponentInterface) => {
      const key: string = this.lcfirst(this.getComponentName(obj, true));
      (acc[key] = acc[key] || []).push(obj.actions);
      return acc;
    }, {});
  }

  private getComponentParents(
    self: ComponentInterface,
    components: ComponentInterface[]
  ): ComponentInterface[] {
    const parents: ComponentInterface[] = [];
    let element: HTMLElement | null = self.element.parentElement;
    const ids: string[] = [];
    while (element) {
      if (
        element.hasAttribute('component') &&
        element.hasAttribute('elementID')
      ) {
        ids.unshift(element.getAttribute('elementID') as string);
      }
      element = element.parentElement;
    }
    components.forEach(component => {
      if (ids.indexOf(component.uuid) !== -1) {
        parents.push(component);
      }
    });
    return parents;
  }

  private getComponentChildren(
    self: ComponentInterface,
    components: ComponentInterface[]
  ): ComponentInterface[] {
    const children: ComponentInterface[] = [];
    const ids: string[] = [];
    self.element
      .querySelectorAll('[component][elementID]')
      .forEach(element =>
        ids.unshift(element.getAttribute('elementID') as string)
      );
    components.forEach(component => {
      if (ids.indexOf(component.uuid) !== -1) {
        children.push(component);
      }
    });
    return children;
  }

  private getComponentSiblings(
    self: ComponentInterface,
    components: ComponentInterface[]
  ): ComponentInterface[] {
    const siblings: ComponentInterface[] = [];
    const element: HTMLElement = self.element;
    const ids: string[] = [];
    let sibling: Node | null = (element.parentNode as HTMLElement).firstChild;
    while (sibling) {
      if (
        sibling.nodeType === 1 &&
        sibling !== element &&
        (sibling as HTMLElement).hasAttribute('component') &&
        (sibling as HTMLElement).hasAttribute('elementID')
      ) {
        ids.unshift((sibling as HTMLElement).getAttribute(
          'elementID'
        ) as string);
      }
      sibling = sibling.nextSibling;
    }
    components.forEach(component => {
      if (ids.indexOf(component.uuid) !== -1) {
        siblings.push(component);
      }
    });
    return siblings;
  }

  private getComponentGlobals(
    self: ComponentInterface,
    components: ComponentInterface[],
    parents: ComponentInterface[],
    children: ComponentInterface[],
    siblings: ComponentInterface[]
  ): ComponentInterface[] {
    const related: string[] = parents
      .concat(children, siblings)
      .map(component => component.uuid);
    return components.filter(
      component =>
        related.indexOf(component.uuid) === -1 && component.uuid !== self.uuid
    );
  }
}
