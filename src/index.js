/* @flow */

import * as PAF from 'preemptive-animation-frame'

export const requestAnimationFrame = PAF.requestAnimationFrame
export const cancelAnimationFrame = PAF.cancelAnimationFrame
export const forceAnimationFrame = PAF.forceAnimationFrame

export const ATTRIBUTE_NODE = 2
export const ELEMENT_NODE = 1
export const TEXT_NODE = 3
export const PROPERTY_NODE = -1
export const EVENT_HANDLER_NODE = -2
export const THUNK_NODE = -3
export const WIDGET_NODE = -4

export class Text {
  nodeType = TEXT_NODE
  data: string
  constructor(data:string) {
    this.data = data
  }
  map <tagged> (f:(input:*) => tagged):Text {
    return this
  }
}

export class PlainElement <message> {
  nodeType = ELEMENT_NODE
  namenspaceURI:?string
  tagName:string
  settings:Settings<message>
  children:Array<Node<message>>
  constructor(namespaceURI:?string, tagName:string, settings:Settings<message>, children:Array<Node<message>>) {
    this.namenspaceURI = namespaceURI
    this.tagName = tagName
    this.settings = settings
    this.children = children
  }
  map <tagged> (f:(input:message) => tagged):TaggedElement<message, tagged> {
    return new TaggedElement(this, f)
  }
}

export class TaggedElement <inner, outer> {
  nodeType = ELEMENT_NODE
  node:PlainElement<inner>
  tag:(message:inner) => outer
  constructor(node:PlainElement<inner>, tag:(message:inner) => outer) {
    this.node = node
    this.tag = tag
  }
  map <tagged> (f:(input:outer) => tagged):TaggedElement<inner, tagged> {
    return new TaggedElement(this.node, payload => f(this.tag(payload)))
  }
}



export class PlainThunk <message> {
  nodeType = THUNK_NODE
  view:(...args:Array<*>) => string | Text | PlainElement<message> | TaggedElement <*, message> | PlainWidget<message>
  args:Array<*>
  node:? string | Text | PlainElement<message> | TaggedElement <*, message> | PlainWidget<message>
  constructor(view:(...args:Array<*>) => string | Text | PlainElement<message> | TaggedElement <*, message> | PlainWidget<message>, args:Array<*>) {
    this.view = view
    this.args = args
  }
  map <tagged> (f:(input:message) => tagged):TaggedThunk<message, tagged> {
    return new TaggedThunk(this, f)
  }
}

export class TaggedThunk <inner, outer> {
  nodeType = THUNK_NODE
  node:PlainThunk<inner>
  tag:(message:inner) => outer
  constructor(node:PlainThunk<inner>, tag:(message:inner) => outer) {
   this.node = node
   this.tag = tag
  }
  map <tagged> (f:(input:outer) => tagged):TaggedThunk<inner, tagged> {
    return new TaggedThunk(this.node, payload => f(this.tag(payload)))
  }
}

export class PlainWidget <message> {
  nodeType = WIDGET_NODE
  map <tagged> (f:(input:message) => tagged):TaggedWidget<message, tagged> {
    return new TaggedWidget(this, f)
  }
  init():HTMLElement {
    throw new Error('Not implemented')
  }
  update(previous:self, element:HTMLElement):?HTMLElement {
    throw new Error('Not implemneted')
  }
  destroy(element:HTMLElement):void {
  }
}

export class TaggedWidget <inner, outer> {
  nodeType = WIDGET_NODE
  node: PlainWidget<inner>
  tag:(message:inner) => outer
  constructor(node:PlainWidget<inner>, tag:(message:inner) => outer) {
   this.node = node
   this.tag = tag
  }
  map <tagged> (f:(input:outer) => tagged):TaggedWidget<inner, tagged> {
    return new TaggedWidget(this.node, payload => f(this.tag(payload)))
  }
  init():HTMLElement {
    throw new Error('Not implemented')
  }
  update(previous:self, element:HTMLElement):?HTMLElement {
    throw new Error('Not implemneted')
  }
  destroy(element:HTMLElement):void {
  }
}


export class Property <kind> {
  nodeType = PROPERTY_NODE
  name: string
  value: kind
}

export class Attribute {
  nodeType = ATTRIBUTE_NODE
  name: string
  value: string
}

export type HandlerOptions <message> = {
  stopPropagation(data:message): boolean,
  preventDefault(data:message): boolean
}

export type Decoder <message> =
  (input:Object) => message

export class EventHandler <message> {
  nodeType = EVENT_HANDLER_NODE
  name: string
  options: HandlerOptions <message>
  capture: boolean
  root: boolean
  decoder: Decoder <message>
}

export type Node <message> =
  | string
  | Text
  | PlainElement <message>
  | TaggedElement <*, message>
  | PlainThunk <message>
  | TaggedThunk <*, message>
  | PlainWidget <message>
  | TaggedWidget <*, message>

export type Setting <message> =
  | Attribute
  | Property<*>
  | EventHandler<message>

export type Settings <message> = {
  attributes?: {[key:string]: string|number|boolean},
  style?: {[key:string]: string|number|boolean},
  value?: string|number|boolean,
  [key:string]: Setting<message> | *
}

export class Driver {
  target:HTMLElement
  constructor({target}:{target:HTMLElement}) {
    this.target = target
  }
  execute <message> (node:Node<message>, process:{send(payload:message):void}):void {
    requestAnimationFrame(_ => this.render(node))
  }
  render <message> (node:Node<message>):void {

  }
}
