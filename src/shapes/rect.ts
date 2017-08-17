import ICell from '../interface/ICell'
import ICellStyle from '../interface/ICellStyle'
import IGraph from '../interface/IGraph'
import IPoint from '../interface/IPoint'

import IShape from '../interface/IShape'
import * as util from '../util/index'

class Rect implements IShape {
  public graph: IGraph
  private element: SVGElement
  private style: ICellStyle
  private data: ICell

  constructor(graph: IGraph, data: ICell) {
    this.graph = graph
    this.data = data
    this.style = util.parseStyle(data.style)
    this.element = util.createSVGElement('rect')
    util.setAttribute(this.element, 'fill', this.style.fillColor)
  }

  public resize(): void {
    const scale: number = this.graph.getScale()
    const center: IPoint = this.graph.getCenter()
    const offset: IPoint = this.graph.getOffset()

    const cx = (this.data.x + this.data.width / 2) + offset.x
    const cy = (this.data.y + this.data.height / 2) + offset.y
    const newX = center.x - (center.x - cx) * scale
    const newY = center.y - (center.y - cy) * scale

    util.setAttribute(this.element, 'x', newX + '')
    util.setAttribute(this.element, 'y', newY + '')
    util.setAttribute(this.element, 'width', this.data.width * scale + '')
    util.setAttribute(this.element, 'height', this.data.height * scale + '')
  }

  public setElement(element: SVGElement): void {
    this.resize()
    this.element = element
  }

  public getHtml(): string {
    this.resize()
    return this.element.outerHTML
  }

  public getElement(): SVGElement {
    return this.element
  }
}

export { Rect }
