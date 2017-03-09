(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Graph = factory());
}(this, (function () { 'use strict';

var randomInt = function (min, max) {
  if ( min === void 0 ) min = 0;
  if ( max === void 0 ) max = 1000;

  return Number(min) + Math.floor(Math.random() * (Number(max) - Number(min)))
};

var randomRgb = function () {
  return 'rgb(' + randomInt(0, 255) + ', ' + randomInt(0, 255) + ', '+ randomInt(0, 255) +')'
};

var error = function (errorMsg) {
  throw new Error(errorMsg)
};

var SVG_NS = 'http://www.w3.org/2000/svg';

var createElement = function (tagName) {
  return document.createElementNS(SVG_NS, tagName)
};

var setAttribute = function (element, attr, value, ns) {
  element.setAttributeNS(ns, attr, value);
};

var getAttribute = function (element, attr, ns) {
  element.getAttributeNS(ns, attr);
};

var separateChar1 = ';';
var separateChar2 = '=';

var parseStyle = function (style) {
  var o = {};

  if (typeof style === 'string') {
    style.split(separateChar1).forEach(function (item) {
      var arr = item.split(separateChar2);
      if (arr.length === 2) {
        o[arr[0]] = arr[1];
      }
    });
  }

  return check(o)
};

var check = function (o) {
  o.fillColor = o.fillColor ? o.fillColor : 'green';
  return o
};



var util = Object.freeze({
	randomInt: randomInt,
	randomRgb: randomRgb,
	error: error,
	createElement: createElement,
	setAttribute: setAttribute,
	getAttribute: getAttribute,
	parseStyle: parseStyle
});

var initMixin = function (Graph) {

	/**
	 * Init Element, Exclude tag name equal 'svg'
	 * Recommend assign DIV Element
	 * @param element
	 * @param option
	 * @private
	 */
  Graph.prototype._init = function (element, option) {
    if ( element === void 0 ) element = error('error: element must be a HTMLElement object');
    if ( option === void 0 ) option = {};

    this._element = element;
    this._option = option;

    if (typeof element === 'object' && element instanceof HTMLElement && element.tagName !== 'TAG') {
      this._initElement();
      this._initOption();
    } else {
			// throw error and stop running script
      if (element instanceof HTMLElement && element.tagName.toLowerCase() === 'tag') {
        error('Can\'t into SVG element.');
      } else {
        error('Element must be a HTMLElement object.');
      }
    }
  };

  Graph.prototype._initElement = function () {

		// Check element position value of style
    var position = this._element.style.position;
    if (['absolute', 'relative'].indexOf(position) === -1) {
      this._element.style.position = 'relative';
    }

		// Init element style
    this._element.style.padding = 0;

		// Append svg to element
    this._svgElement = createElement('svg');
    setAttribute(this._svgElement, 'width', '100%');
    setAttribute(this._svgElement, 'height', '100%');
    this._svgElement.style.cssText = [
      'padding: 0',
      'left: 0',
      'top: 0',
      'width: 100%',
      'height: 100%',
      'position: absolute'
    ].join(';');

    this._element.appendChild(this._svgElement);
  };

  Graph.prototype._initOption = function (option) {
    if ( option === void 0 ) option = {};

    this._option = option;
  };

  Graph.prototype.clear = function () {
    this._svgElement.innerHTML = '';
		// this._svgElement.childNodes.forEach((node) => {
		// 	this._svgElement.removeChild(node)
		// })
  };

  Graph.prototype.getCenter = function () {
    return {
      x : this._svgElement.clientWidth / 2,
      y : this._svgElement.clientHeight / 2
    }
  };
};

function Rect (graph, data) {
  this.data = data;
  this.graph = graph;
  this.style = parseStyle(this.data.style);
  this.init();
}

/**
 * Require definition
 */
Rect.prototype.init = function () {
  this.element = createElement('rect');

  var center = this.graph.getCenter();
  var cx = this.data.x + this.data.width / 2;
  var cy = this.data.y + this.data.height / 2;

  var newX = (center.x - cx) * this.graph.zoomFactor + center.x;
  var newY = (center.y - cy) * this.graph.zoomFactor + center.y;

  setAttribute(this.element, 'x', newX);
  setAttribute(this.element, 'y', newY);
  setAttribute(this.element, 'width', this.data.width * this.graph.zoomFactor);
  setAttribute(this.element, 'height', this.data.height * this.graph.zoomFactor);
  setAttribute(this.element, 'fill', this.style.fillColor);
  this.graph._svgElement.appendChild(this.element);
};

function Circle (graph, data) {
  this.data = data;
  this.graph = graph;
  this.style = parseStyle(this.data.style);
  this.init();
}

/**
 * Require definition
 */
Circle.prototype.init = function () {
  var size;
  this.element = createElement('ellipse');

  size = this.data.width ? this.data.width : this.data.height;
  size *= this.graph.zoomFactor;
  setAttribute(this.element, 'cx', this.data.x * this.graph.zoomFactor + size / 2);
  setAttribute(this.element, 'rx', size / 2);

  size = this.data.height ? this.data.height : this.data.width;
  size *= this.graph.zoomFactor;
  setAttribute(this.element, 'cy', this.data.y * this.graph.zoomFactor + size / 2);
  setAttribute(this.element, 'ry', size / 2);

  setAttribute(this.element, 'fill', this.style.fillColor);
  this.graph._svgElement.appendChild(this.element);
};

var shapes = {
  rect: Rect,
  circle: Circle
};


var shapeMixin = function (Graph) {

	/**
	 * Register shape
	 * @param name
	 * @param shape
	 */
  Graph.prototype.setShape = function (name, shape) {
    shapes[name] = shape;
  };

	/**
	 * Get shape by name
	 * @param name
	 */
  Graph.prototype.getShape = function (name) {
    return shapes[name]
  };
};

/**
 * warn
 * @param msg
 */
var warn = function (msg) {
	console.warn(msg);
};

/**
 * log
 * @param msg
 */

/**
 * Diff json
 * @type {{}}
 */
// const state = {}

var renderMixin = function (Graph) {

  Graph.prototype._checkNodeData = function (node) {
    return typeof node.x === 'number'
			&& typeof node.y === 'number'
			&& typeof node.width === 'number'
			&& typeof node.height === 'number'
			&& this.getShape(node.shape)
  };

	/**
	 * Source from _json property
	 */
  Graph.prototype.render = function () {
    var this$1 = this;

    this.clear();

		// TODO nodes
    if (Array.isArray(this._json.nodes)) {
      this._json.nodes.filter(function (item) { return this$1._checkNodeData(item); }).forEach(function (item) {
        this$1._createShape(item);
      });
    }
  };

  Graph.prototype._createShape = function (item) {
    var Shape = this.getShape(item.shape);
    if (Shape) {
      new Shape(this, item);
    }
  };
};

var jsonMixin = function (Graph) {

	/**
	 * Require JSON string
	 */
  Graph.prototype.loadJson = function (json) {
		// TODO Inject loading tips
    try {
      this._json = JSON.parse(json);
    } catch (e) {
      warn(e);
    } finally {
			// TODO Inject loading tips
    }
  };

	// TODO Insert node
	/**
	 * x, y, width, height, shape
	 */
  Graph.prototype.insertNode = function () {};

	// TODO Insert line
  Graph.prototype.insertLine = function () {};

  Graph.prototype._json = {};

  Graph.prototype.getJson = function () {
    var json = '';

		// TODO Inject loading tips

    try {
      json = JSON.stringify(this._json);
    } catch (e) {
      warn(e);
    } finally {
			// TODO Inject loading tips
    }

    return json
  };
};

var zoomMixin = function (Graph) {
  var maxZoomFactor = 2;
  var minZoomFactor = 0.1;
  var zoomStep = 0.1;

  Graph.prototype.zoomFactor = 1;

  Graph.prototype.setMinZoomFactor = function (value) {
    minZoomFactor = value;
  };

  Graph.prototype.getMinZoomFactor = function () {
    return minZoomFactor
  };

  Graph.prototype.zoomOut = function () {
    if (this.zoomFactor > minZoomFactor) {
      this.zoomFactor = Number((this.zoomFactor - zoomStep).toFixed(2));
      this.render();
    }
  };

  Graph.prototype.zoomIn = function () {
    if (this.zoomFactor < maxZoomFactor) {
      this.zoomFactor = Number((this.zoomFactor + zoomStep).toFixed(2));
      this.render();
    }
  };
};

function Graph (element, option) {
  if (!(this instanceof Graph)) {
    var msg = 'Graph is a constructor and should be called with the `new` keyword';
    warn(msg);
		// error('Graph is a constructor and should be called with the `new` keyword')
  }
  this._init(element, option);
}

initMixin(Graph);
shapeMixin(Graph);
renderMixin(Graph);
jsonMixin(Graph);
zoomMixin(Graph);

Graph.util = util;

return Graph;

})));
