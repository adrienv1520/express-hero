/**
 * VanilleJS library by Adrien Valcke © 2016
 *
 * The aim of this library is to promote the use of pure vanilla js and
 * to only provide a structure, performance and useful methods that would be too verbose or redondant in pure vanilla JS.
 *
 */

/**
 * IEF FUNCTION V
 * Main variable to be loaded and used.
 *
 * First part : v alias vanilleJS object that provides a main function to wait for DOM loading and useful methods on objects.
 * Second part : Vanille object that wraps DOM elements to add some useful methods for them with full transparence (using Proxy).
 *
 * @return {Function} v     returns v main function
 */
var vanilleJS = (function() {

  /* NOTE FIRST PART */

  /**
   * FUNCTION V
   * Main entry point to load DOM or to find an element in it.
   *
   * @param  {Function} cb    a callback function or a selector
   * @return {Element}        returns an element type matching in DOM or initialize app and execute callback function
   */
  var v = function(cb) {
    if (typeof cb === 'function') {
      // 'interactive' fires DOMContentLoaded, 'complete' fires load (document and all sub-resources are loaded such as images, scripts, css, ...)
      // check readyState to ensure at this moment of the script DOMContentLoaded has not already been fired, if not add event listener
      if (document.readyState !== 'loading') {
        init();
        cb();
      } else {
        document.addEventListener('DOMContentLoaded', function(event) {
          init();
          cb();
        });
      }
    } else if (v.type(cb) === 'string' && v.isInitialized){
      return new Vanille(cb);
    }
  };

  /**
   * FUNCTION ALIAS
   * Returns v to be used for aliasing
   *
   * eg. : var $v = vanilleJS.alias();
   * 				$v(function() { ... });
   *
   * or without alias call :
   * (vanilleJS(function(v) {
   * 	...
   * }))(vanilleJS);
   */
  v.alias = function() {
    return v;
  };

  /**
   * FUNCTION INIT
   * Initialize each useful function that v uses
   *
   */
  function init() {

    /* AJAX METHODS */

    /**
     * FUNCTION AJAXREQUEST
     * Send a request and manage events from Node server.
     *
     * @param              {Object}       params      request parameters (method, url, data, format)
     * @param and @return  {Function}     cb          request callback function (data, error) : data or error response from server
     * @param and @return  {Function}     progress    progress callback function ({percent, loaded, total}) that catches an object with 3 properties : percentage progression, bytes loaded and total bytes
     */
    var AjaxRequest = function(params, cb, progress) {
      // allowed methods and formats
      var allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
      var allowedFormats = ['JSON', 'XML', ''];

      // get params and format
      var method = params.method || allowedMethods[0];
      var url = params.url || '/';
      var data = params.data || null;
      var format = params.format || ''; // text format by default

      method = method.toUpperCase();
      format = format.toUpperCase();
      // console.log('METHOD : ' + method + '\nURL : ' + url + '\nFORMAT : ' + format + '\nDATA : ' + data);

      // handle errors
      if (!~allowedMethods.indexOf(method)) return cb(null, 'Bad request method : ' + method);
      if (!~allowedFormats.indexOf(format)) return cb(null, 'Bad request format : ' + format);
      if (data && !(typeof data === 'object')) return cb(null, 'Data must be an object in a valid JSON format : ' + data);
      if ((method === 'POST' || method === 'PUT') && !data) return cb(null, 'No data to send for method ' + method);

      // open new xhr request
      var req = new XMLHttpRequest();

      /* request events */

      // on progress (optional function)
      if (progress && typeof progress === 'function') {
        req.onprogress = function(e) {
            // if total > 1 Mo
            if (e.lengthComputable && e.total > 1000000) {
              return progress({percent: (e.loaded / e.total) * 100, loaded: e.loaded, total: e.total});
            }
        };
      }

      // on load
      req.onload = function(e) {
        if (req.status >= 200 && req.status < 400) {
          var dataLoaded = null;
          if (format === 'JSON') {
            try {
              dataLoaded = JSON.parse(req.responseText);
            } catch (e) {
              return cb(null, 'Object sent from server in an invalid JSON format : ' + e);
            }
          } else {
            dataLoaded = req.responseText;
          }
          return cb(dataLoaded, null);
        } else {
          return cb(null, 'Server responsed with an error status ' + e.target.status);
        }
      };

      // on error
      req.onerror = function(e) {
        return cb(null, 'An error ' + e.target.status + ' occurs on the request');
      };

      // on timeout
      req.ontimeout = function(e) {
        return cb(null, 'The request for ' + url + ' timed out');
      };

      // open request
      req.open(method, url, true);

      // set timeout at 10 seconds
      req.timeout = 10000;

      // try to find a token to send to server
      var csrf = document.querySelector('input[name=_csrf]');
      if (csrf) {
        data = data || {};
        data._csrf = csrf.value;
      }

      /* request headers */

      // send header to Node server to detect request in req.xhr
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      // prepare xhr request data
      if (data) {
        data = encodeURIData(data);
        req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      }

      // send xhr request
      req.send(JSON.stringify(data));
    };

    /**
     * FUNCTION ENCODEURIDATA
     * Encode each value in data object recursively if object contains sub object(s)
     * @param  {Object} data
     * @return {Object} data
     */
    var encodeURIData = function (data) {
      if (data && typeof data === 'object') {
        for (var prop in data) {
          if (data.hasOwnProperty(prop)) {
            if (typeof data[prop] === 'object') {
              encodeURIData(data[prop]);
            } else {
              data[prop] = encodeURIComponent(data[prop]);
            }
          }
        }
      }
      return data;
    };

    /**
     * AJAX FUNCTION GET
     * @param  {String}     url       url (eg. /users)
     * @param  {Function}   cb        request callback function (data, error)
     * @param  {Function}   progress  progress callback function ({percent, loaded, total})
     *
     * Example :
     *
     * v.get('/users', function(data, error) {
     * 	...
     * }, function(progress) {
     * 	progress.percent...
     * 	progress.loaded...
     * 	progress.total...
     * 	...
     * });
     */
    v.get = function(url, cb, progress) {
      AjaxRequest({method: 'GET', url: url}, cb, progress);
    };

    /**
     * AJAX FUNCTION GETJSON
     * @param  {String}     url       url (eg. /songs)
     * @param  {Function}   cb        request callback function (data, error)
     * @param  {Function}   progress  progress callback function ({percent, loaded, total})
     */
    v.getJSON = function(url, cb, progress) {
      AjaxRequest({method: 'GET', url: url, format: 'JSON'}, cb, progress);
    };

    /**
     * AJAX FUNCTION POST
     * @param  {String}     url       url (eg. /users)
     * @param  {Function}   cb        request callback function (data, error) in JSON format
     * @param  {Function}   progress  progress callback function ({percent, loaded, total})
     */
    v.post = function(url, data, cb, progress) {
      AjaxRequest({method: 'POST', url: url, data: data, format: 'JSON'}, cb, progress);
    };

    /**
     * AJAX FUNCTION PUT
     * @param  {String}     url       url (eg. /users/:id)
     * @param  {Function}   cb        request callback function (data, error) in JSON format
     * @param  {Function}   progress  progress callback function ({percent, loaded, total})
     */
    v.put = function(url, data, cb, progress) {
      AjaxRequest({method: 'PUT', url: url, data: data, format: 'JSON'}, cb, progress);
    };

    /**
     * AJAX FUNCTION DELETE
     * @param  {String}     url       url (eg. /users/:id)
     * @param  {Function}   cb        request callback function (data, error) in JSON format
     * @param  {Function}   progress  progress callback function ({percent, loaded, total})
     */
    v.delete = function(url, cb, progress) {
      AjaxRequest({method: 'DELETE', url: url, format: 'JSON'}, cb, progress);
    };

    /**
     * AJAX FUNCTION AJAX
     * @param   {Object}     params      request parameters (method, url, data, format)
     * @param   {Function}   cb          request callback function (data, error)
     * @param   {Function}   progress    progress callback function ({percent, loaded, total})
     */
    v.ajax = function(params, cb, progress) {
      var errors = false;
      var method,
          url,
          data,
          format;

      if (!(method = params.method)) return cb(null, 'No request method');
      if (!(url = params.url)) return cb(null, 'No request url');
      data = params.data || null;
      format = params.format || '';

      AjaxRequest({method: method, url: url, data: data, format: format}, cb, progress);
    };

    /* USEFUL V METHODS */

    /**
     * FUNCTION ISNUMBER
     * @param  of any kind    thing     any variable
     * @return {Boolean}                true if a number, false if not
     */
    v.isNumber = function(thing) {
      if (thing === 0) return true;
      return Boolean(~~thing); // ~~ returns 0 if not a number or the Math.floor() result
    };

    v.isArray = function(array) {
      return Array.isArray(array);
    };

    v.isInArray = function(element, array) {
      return Boolean(~array.indexOf(element)); // ~-1 will return 0, false
    };

    v.type = function(thing) {
      if (!typeof thing || thing === null || thing === undefined || Number.isNaN(thing)) return false;

      var type = typeof (thing.valueOf());
      if (type === 'object' || type === 'Object') {
        var constructor = thing.constructor.name;
        if (constructor) type = constructor;
      }

      // or
      //return Object.getPrototypeOf(Object(thing)).constructor.name.toLowerCase();

      return type.toLowerCase();
    };

    // use : v.is('hello', String)
    v.is = function(thing, fromType) {
      if (!typeof fromType || fromType === null || fromType === undefined || Number.isNaN(fromType) || !fromType.prototype) return false;
      return fromType.prototype.isPrototypeOf(Object(thing)); // a define JavaScript object always has a prototype
    };

    v.isDefined = function(thing) {
      // to be sure a 'variable' exists and is defined,
      //    "if (!typeof variable)" must be used at the very first moment before using this variable (so here it is too late!)
      //    if undefined or no reference, typeof will return "undefined" and won't throw an exception
      return !(!typeof thing || thing === null || thing === undefined); // a NaN variable is considered defined
    };

    v.hasProperty = function(property, thing) {
      for (var prop in thing) {
        if (property === prop) return true;
      }
      return false;
    };

    v.getAllProperties = function(thing) {
      var properties = [];
      for (var prop in thing) {
        properties.push(prop);
      }
      return properties;
    };

    v.parseJSON = function(jsonString) {
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        return false;
      }
    };

    v.parseHTML = function(htmlString) {
      // No use of DOMParser cause it may throw errors in some browsers
      if (v.isDefined(document.implementation.createHTMLDocument)) {
        var doc = document.implementation.createHTMLDocument('');
        if (~htmlString.toLowerCase().indexOf('<!doctype>')) {
          doc.documentElement.innerHTML = htmlString;
          return doc;
        } else {
          doc.body.innerHTML = htmlString;
          var htmlElements = doc.body.children;
          if (htmlElements.length === 1 && v.type(htmlElements[0]) !== 'htmlunknownelement') return htmlElements[0];
          return doc.body.children;
        }
      } else {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = htmlString;
        return wrapper.children;
      }
    };

    v.parseXML = function(xmlString) {
      if (v.isDefined(DOMPArser)) {
        return (new DOMParser()).parseFromString(xmlString, "application/xml");
      } else {
        return false;
      }
    };

    v.parseSVG = function(xmlString) {
      if (v.isDefined(DOMPArser)) {
        return (new DOMParser()).parseFromString(xmlString, "image/svg+xml");
      } else {
        return false;
      }
    };

    v.getRandom = function() {
      return Math.random();
    };

    v.getRandomNumber = function(min, max) {
      return Math.random() * (max - min) + min;
    };

    v.getRandomInt = function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    };

    v.getRandomIntInclusive = function(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // trim :             string.trim()
    // now :              Date.now()

    v.isInitialized = true;
  }


  /* NOTE SECOND PART */

  /**
   * Vanille Object for the future (use Proxy) that wraps DOM element to provide useful methods with full transparence (using Proxy).
   * Return a new Proxy to handle getter and setter moment :
   * 		if a property/method does not exist in Vanille object, it uses the property/method of the DOM element directly (Vanille.prototype.element) or returns null if nothing found
   *
   * Notice that if a selector matches more than one element, Vanille elements are created for each element found and pushed in Vanille.prototype.elements
   */
  function Vanille(selector) {
    // if selector is from Node type (when a previous selector matches multiple DOM elements)
    if (Node.prototype.isPrototypeOf(selector)) {
      this.element = selector;
    // if not, query DOM for this string selector
    } else {

      var element = null,
          firstOrLast = /:first|:last/,
          selectOnlyOne = false;

      if (firstOrLast.test(selector)) {
        selector = selector.replace(firstOrLast, '');
        selectOnlyOne = true;
      }
      if (~selector.indexOf('#')){
        selectOnlyOne = true;
      }

      // query DOM or catch SyntaxError for an invalid or illegal css selector
      try {
        element = selectOnlyOne ? document.querySelector(selector) : document.querySelectorAll(selector);
      } catch (e) {}

      // if element contains multiple elements (after a querySelectorAll)
      if (NodeList.prototype.isPrototypeOf(element)) {
        var elements = [];
        Array.prototype.forEach.call(element, function(element, index) {
          elements.push(new Vanille(element));
        });
        this.elements = elements;
        this.length = elements.length;
      // if element is a simple DOM element
      } else if (Node.prototype.isPrototypeOf(element)) {
        this.element = element;
        this.length = 1;
      }
    }
    return new Proxy(this, vanilleHandler);
  };

  /**
   * vanille handler
   *
   * get : try to get the property/method of current Vanille object,
   * 			 if not found get the property/method from wrapped DOM element(s).
   *
   * set : set a value to the current Vanille Object property or if not found to the DOM element one.
   */
  var vanilleHandler = {
    get: function(obj, prop) {
      if (obj.hasOwnProperty(prop) || Object.getPrototypeOf(obj).hasOwnProperty(prop)) return obj[prop];

      if (obj.hasOwnProperty('element')) {
        for (var p in obj['element']) {
          if (p === prop) return obj['element'][prop];
        }
      }

      if (obj.hasOwnProperty('elements')) {
        for (var p in obj['elements']) {
          if (p === prop) return obj['elements'][prop];
        }
      }

      return obj[prop];
    },
    set: function(obj, prop, value) {
      if (obj.hasOwnProperty(prop) || Object.getPrototypeOf(obj).hasOwnProperty(prop)) {
        obj[prop] = value;
        return true;
      } else if (obj.hasOwnProperty('element')) {
        for (var p in obj['element']) {
          if (p === prop) {
            obj['element'][prop] = value;
            return true;
          }
        }
      } else {
        return false;
      }

      // if (obj.hasOwnProperty(prop) || Object.getPrototypeOf(obj).hasOwnProperty(prop)) {
      //   obj[prop] = value;
      //   return true;
      // } else if (obj.hasOwnProperty('element') && (obj['element'].hasOwnProperty(prop) || obj['element'].hasAttribute(prop) || Object.getPrototypeOf(obj['element']).hasOwnProperty(prop))) {
      //   obj['element'][prop] = value;
      //   return true;
      // } else {
      //   return false;
      // }
    }
  };

  Vanille.prototype.element = null;
  Vanille.prototype.elements = [];
  Vanille.prototype.length = 0;

  // exist
  Vanille.prototype.exist = function() {
    return Boolean(this.element || this.elements.length);
  };

  // length
  // Vanille.prototype.length = function() {
  //   var length = 0;
  //   if (this.element) length = 1;
  //   if (this.elements) length = this.elements.length;
  //   return lentgh;
  // };

  /* STYLE */

  // get style :          getComputedStyle(element)[cssRule]
  // add class :          element.classList.add(className)
  // remove class :       element.classList.remove(className)
  // toggle class :       element.classList.toggle(className)
  // has class :          element.classList.contains(className)

  // fadeIn
  Vanille.prototype.fadeIn = function() {
    var element = this.element;
    element.classList.add('show');
    element.classList.remove('hide');

    // css
    // .show { transition: opacity 500ms ease; }
    // .hide { opacity: 0; }
  };

  // hide
  Vanille.prototype.hide = function() {
    this.element.style.visibility = 'hidden';
  };

  // show
  Vanille.prototype.show = function() {
    this.element.style.visibility = 'visible';
  };

  /* DOM INSERTS */

  // append :             parent.appendChild(element)
  // prepend :            parent.insertBefore(element, parent.firstChild)

  // before
  Vanille.prototype.before = function(htmlString) {
    this.element.insertAdjacentHTML('beforebegin', htmlString);
  };

  // before end
  Vanille.prototype.beforeEnd = function(htmlString) {
    this.element.insertAdjacentHTML('beforeend', htmlString);
  };

  // after
  Vanille.prototype.after = function(htmlString) {
    this.element.insertAdjacentHTML('afterend', htmlString);
  };

  // after begin
  Vanille.prototype.afterBegin = function(htmlString) {
    this.element.insertAdjacentHTML('afterbegin', htmlString);
  };

  // insert after
  Vanille.prototype.insertAfter = function(insertThisElement, afterThisElement) {
    var parent = afterThisElement.parentNode;
    if (this.element === parent) {
      if (afterThisElement === parent.lastChild) {
        parent.appendChild(insertThisElement);
        return true;
      } else {
        parent.insertBefore(insertThisElement, afterThisElement.nextSibling);
        return true;
      }
    } else {
      return false;
    }
  };

  // replaceWith :        element.outerHTML = htmlString
  // remove :             element.parentNode.removeChild(element) or parent.removeChild(element)
  // clone :              element.cloneNode(true)

  /* FIND AND CONTAINS */

  // contains
  Vanille.prototype.contains = function(childElement) {
    return this.element !== childElement && this.element.contains(childElement);
  };

  // contains selector :  element.find(selector).exist()

  // is :                 element === otherElement

  // find
  Vanille.prototype.find = function(selector) {
    return new Vanille(selector);
  };

  // siblings
  Vanille.prototype.siblings = function() {
    return Array.prototype.filter.call(this.element.parentNode.children, function(childElement) {
      return childElement !== this.element;
    });
  };

  /* DOM ELEMENTS AND ATTRIBUTES */

  // parent :             element.parentNode
  // children :           element.children
  // next :               element.nextElementSibling
  // previous :           element.previousElementSibling

  // get attribute :      element.getAttribute(name)
  // set attribute :      element.setAttribute(name, value)

  // get html :           element.innerHTML
  // set html :           element.innerHTML = htmlString

  // get outer html :     element.outerHTML
  // replaceWith :        element.outerHTML = htmlString

  // get text :           element.textContent
  // set text :           element.textContent = text

  // empty :              element.innerHTML = ''

  /* DOM ELEMENTS POSITION */

  // position :           element.offsetLeft, element.offsetTop

  // offset
  Vanille.prototype.offset = function() {
    var top = 0,
        left = 0,
        element = this.element;

    if (element) {
      do {
        top += element.offsetTop;
        left += element.offsetLeft;
      } while (element = element.offsetParent);

      // var rect = element.getBoundingClientRect(),
      //     bodyElt = document.body;
      // top = rect.top + bodyElt.scrollTop;
      // left = rect.left + bodyElt.scrollLeft;
    }
    return {
      top: top,
      left: left
    }
  };

  // offset parent :      element.offsetParent || element

  // outer height :       el.offsetHeight

  // outer height with margin
  Vanille.prototype.outerHeightMargin = function() {
    var height = this.element.offsetHeight,
        style = getComputedStyle(this.element);
    height += parseInt(style.marginTop) + parseInt(style.marginBottom);
    return height;
  };

  // outer width:         el.offsetWidth

  // outer width with margin
  Vanille.prototype.outerWidthMargin = function() {
    var width = this.element.offsetWidth,
        style = getComputedStyle(this.element);
    width += parseInt(style.marginLeft) + parseInt(style.marginRight);
    return width;
  };

  /* position relative
   * to viewport :        el.getBoundingClientRect() */

  /* EVENTS */

  // remove/off : el.removeEventListener(name, handler)
  // add/on : el.addEventListener(name, handler)

  return v;

})();

if (typeof v === 'undefined') var v = vanilleJS; // no conflict with another v-named variable
