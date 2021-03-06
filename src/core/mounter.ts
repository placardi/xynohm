import { WithElement } from '../types/common';
import {
  Actionable,
  ComponentDefinition,
  ComponentInterface
} from '../types/component';
import { Configuration } from '../types/configuration';
import { MounterInterface } from '../types/mounter';
import { RouteInterface } from '../types/route';
import { RouterInterface } from '../types/router';
import {
  camelCaseToDash,
  convertDataType,
  dashToCamelCase,
  evaluateObjectFromPattern,
  generateUUID,
  getComponentName,
  isCustomElement,
  isString,
  lcfirst,
  ucfirst
} from './utils';

export class Mounter implements MounterInterface {
  private appData: object;
  private content: WithElement;
  private router: RouterInterface;
  private configuration: Configuration;
  private components: ComponentDefinition[];
  private mountedElement: HTMLElement;
  private mountedComponents: { [key: string]: ComponentInterface[] };
  private mountedGlobalComponents: ComponentInterface[];
  private componentsLoadedEvent: CustomEvent;
  private modelRefs: { [key: string]: object };
  private global: boolean = false;

  constructor(
    content: WithElement,
    configuration: Configuration,
    components: ComponentDefinition[],
    router: RouterInterface,
    global?: boolean
  ) {
    this.appData = {};
    this.content = content;
    this.router = router;
    this.components = components;
    this.configuration = configuration;
    this.componentsLoadedEvent = new CustomEvent('__components_loaded__');
    this.modelRefs = {};
    this.global = !!global;
    this.mountedComponents = {};
    this.mountedGlobalComponents = [];
  }

  public mountComponent(
    component: ComponentDefinition,
    data?: object,
    attributes?: object
  ): HTMLElement {
    return this._mountComponent(component, data || {}, attributes || {});
  }

  public unmountComponent(elementID: string): void {
    const parsedRoutePath: string = this.getActiveRoutePath();
    const componentToRemove:
      | ComponentInterface
      | undefined = this.getMountedComponents(parsedRoutePath).find(
      component => component.uuid === elementID
    );
    if (componentToRemove) {
      const componentAndChildren: ComponentInterface[] = [
        componentToRemove,
        ...this.getComponentChildren(
          componentToRemove,
          this.getMountedComponents(parsedRoutePath)
        )
      ];
      const newComponents: ComponentInterface[] = this.getMountedComponents(
        parsedRoutePath
      ).filter(component => componentAndChildren.indexOf(component) === -1);
      if (this.global) {
        this.mountedGlobalComponents = newComponents;
      } else {
        this.mountedComponents[parsedRoutePath] = newComponents;
      }
      (componentToRemove.element.parentNode as HTMLElement).removeChild(
        componentToRemove.element
      );
      this.assignDependencies();
    }
  }

  public mountComponents(
    mountedComponents: ComponentInterface[],
    nodes: NodeList,
    data: object,
    path: string
  ): ComponentInterface[] {
    if (this.global) {
      this.mountedGlobalComponents = this.mountedGlobalComponents.concat(
        mountedComponents
      );
    } else {
      if (!(path in this.mountedComponents)) {
        this.mountedComponents[path] = [];
      }
      this.mountedComponents[path] = this.mountedComponents[path].concat(
        mountedComponents
      );
    }
    // this.mountedComponents = this.mountedComponents.concat(mountedComponents);
    const sourceElement: Element = this.content.element();
    this.appData = { ...this.appData, ...data };
    this.mountedElement = this._mountComponents(
      Array.from(nodes).reduce((element: HTMLElement, node: Node) => {
        if (
          isCustomElement(node, this.configuration.tagPrefix, this.components)
        ) {
          this.markElementAsComponent(node as HTMLElement);
        }
        element.appendChild(node);
        return element;
      }, document.createElement(sourceElement.tagName.toLowerCase()))
    );
    this.mountedElement = this.copyAttributes(
      sourceElement,
      this.mountedElement
    );
    (sourceElement.parentNode as Node).replaceChild(
      this.mountedElement,
      sourceElement
    );
    return this.getMountedComponents(path);
  }

  public getMountedComponents(path: string): ComponentInterface[] {
    return this.global
      ? this.mountedGlobalComponents
      : this.mountedComponents[path] || [];
  }

  public getMountedElement(): HTMLElement {
    return this.mountedElement;
  }

  public assignDependencies(components?: ComponentInterface[]): void {
    const parsedRoutePath: string = this.getActiveRoutePath();
    (components || this.getMountedComponents(parsedRoutePath)).forEach(
      component => {
        const parents: ComponentInterface[] = this.getComponentParents(
          component,
          components || this.getMountedComponents(parsedRoutePath)
        );
        const children: ComponentInterface[] = this.getComponentChildren(
          component,
          components || this.getMountedComponents(parsedRoutePath)
        );
        const siblings: ComponentInterface[] = this.getComponentSiblings(
          component,
          components || this.getMountedComponents(parsedRoutePath)
        );
        const globals: ComponentInterface[] = this.getComponentGlobals(
          component,
          components || this.getMountedComponents(parsedRoutePath),
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
      }
    );
  }

  private _mountComponent(
    component: ComponentDefinition,
    properties: { [key: string]: any },
    attributes: object,
    modelRef?: string,
    events?: Attr[],
    internal?: boolean
  ): HTMLElement {
    const expectedProperties: string[] = component.template.getProperties();
    for (const property in properties) {
      if (
        property in properties &&
        expectedProperties.indexOf(property) === -1
      ) {
        delete properties[property];
      }
    }
    expectedProperties.forEach(property => {
      if (
        property in this.appData &&
        typeof properties[property] === 'string'
      ) {
        const result: any = evaluateObjectFromPattern(
          this.appData,
          properties[property]
        );
        if (result) {
          properties = { ...properties, [property]: result };
        }
      }
    });
    const { modelRefs, nodes } = component.template.process(
      !!modelRef ? { ...properties, ...this.modelRefs[modelRef] } : properties,
      this.configuration,
      this.components
    );
    this.modelRefs = { ...this.modelRefs, ...modelRefs };
    const element: HTMLElement = this.createElement(
      this.configuration.tagPrefix +
        '-' +
        camelCaseToDash(getComponentName(component, true)),
      nodes
    );
    if (!internal) {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    const uuid: string = generateUUID();
    this.markElementAsProcessed(element, uuid, events);
    const model: { [key: string]: any } = !!modelRef
      ? { ...properties, ...this.modelRefs[modelRef] }
      : properties;
    const instance: ComponentInterface = new component(
      Object.entries(model)
        .map(([key, value]) =>
          isString(value) && value in model ? [key, model[value]] : [key, value]
        )
        .filter(([key]) => Object.keys(properties).indexOf(key) !== -1)
        .reduce((obj: object, [key, value]) => ({ ...obj, [key]: value }), {}),
      uuid,
      element
    );
    instance.setMounter(this);
    instance.setGlobal(this.global);
    this.bindEvents(element, instance);
    const parsedRoutePath: string = this.getActiveRoutePath();
    if (this.global) {
      this.mountedGlobalComponents.push(instance);
    } else {
      this.mountedComponents[parsedRoutePath].push(instance);
    }
    if (!internal) {
      this.markElementsAsComponents(instance.element);
      this._mountComponents(instance.element);
      const activeRoute:
        | RouteInterface
        | undefined = this.router.getActiveRoute();
      const parsedRoutePath: string = activeRoute
        ? activeRoute.getParsedPath()
        : '__global__';
      const mutationObserver: MutationObserver = new MutationObserver(
        (mutations: MutationRecord[], observer: MutationObserver) => {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
              this.assignDependencies();
              this.getMountedComponents(parsedRoutePath)
                .filter(c => !c.isLoaded())
                .forEach(c => {
                  c.element.dispatchEvent(this.componentsLoadedEvent);
                  if (c.onInit && !c.getIsOnInitExecuted()) {
                    c.onInit();
                    c.setIsOnInitExecuted(true);
                  }
                  c.setMounted(true);
                  if (c.onMount && c.onMount instanceof Function) {
                    c.onMount();
                  }
                  this.router.registerAnchorsWithRoutePaths(c.element);
                });
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

  private markElementAsComponent(element: Element): Element {
    element.setAttribute('component', '');
    return element;
  }

  private _mountComponents(content: HTMLElement): HTMLElement {
    let element: HTMLElement | null = this.getNextUnprocessedElement(content);
    while (element) {
      const elementTag = element.tagName.toLowerCase();
      const componentName =
        ucfirst(
          dashToCamelCase(
            elementTag.replace(this.configuration.tagPrefix + '-', '')
          )
        ) + 'Component';
      const componentIndex = this.components
        .map(component => getComponentName(component).toLowerCase())
        .indexOf(componentName.toLowerCase());
      const mountedElement: HTMLElement = this._mountComponent(
        this.components[componentIndex],
        this.unwrapDataset(element.dataset),
        {},
        element.getAttribute('model-ref') || undefined,
        this.getEvents(element.attributes),
        true
      );
      this.markElementsAsComponents(mountedElement);
      if (mountedElement) {
        (element.parentNode as Node).replaceChild(
          this.copyAttributes(element, mountedElement),
          element
        );
        element = this.getNextUnprocessedElement(content);
      }
    }
    return content;
  }

  private getNextUnprocessedElement(content: Element): HTMLElement | null {
    return content.querySelector('*[component]:not([processed])');
  }

  private markElementsAsComponents(content: Element): void {
    content.querySelectorAll('*').forEach(element => {
      if (
        isCustomElement(element, this.configuration.tagPrefix, this.components)
      ) {
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

  private unwrapDataset(dataset: DOMStringMap): object {
    return Object.entries(dataset)
      .map(([key, value]) => [key, convertDataType(value as string)])
      .reduce((obj: object, [key, value]) => ({ ...obj, [key]: value }), {});
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

  private copyAttributes(from: Element, to: HTMLElement): HTMLElement {
    Array.from(from.attributes).forEach(attribute => {
      try {
        to.setAttribute(attribute.name, attribute.value);
      } catch (e) {
        return;
      }
    });
    return to;
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
        this.getEvents(child.attributes).forEach(
          event =>
            !isCustomElement(
              child,
              this.configuration.tagPrefix,
              this.components
            ) && this.bindEvent(event, instance, child)
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
    const eventType: string = event.name.substr(1);
    const eventName: string = event.value;
    const argumentsIndex: number = eventName.indexOf('(');
    const actionName: string =
      argumentsIndex !== -1 ? eventName.substr(0, argumentsIndex) : eventName;
    const actionNameParts: string[] = actionName.split('.');
    if (actionNameParts.length > 1) {
      const componentName: string = actionNameParts[0];
      const method: string = actionNameParts[1];
      const actions =
        componentName === getComponentName(instance, true)
          ? instance.actions
          : this.getMountedComponents(this.getActiveRoutePath())[
              this.getMountedComponents(this.getActiveRoutePath())
                .map(component => getComponentName(component, true))
                .lastIndexOf(componentName)
            ].actions;
      if (method in actions) {
        element.removeEventListener(eventType, () => actions[method]);
        element.addEventListener(eventType, (e: Event) =>
          actions[method].call(instance, {
            data:
              argumentsIndex !== -1
                ? convertDataType(eventName.slice(argumentsIndex + 1, -1))
                : undefined,
            event: e
          })
        );
      }
    } else {
      throw new Error(
        "Attempting to call '" + actionName + "' of an undefined component"
      );
    }
  }

  private groupByComponentName(components: ComponentInterface[]): Actionable {
    return components.reduce((acc: Actionable, obj: ComponentInterface) => {
      const key: string = lcfirst(getComponentName(obj, true));
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

  private getActiveRoutePath(): string {
    const activeRoute:
      | RouteInterface
      | undefined = this.router.getActiveRoute();
    return activeRoute ? activeRoute.getParsedPath() : '__global__';
  }
}
