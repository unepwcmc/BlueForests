// cartodb.js version: 2.0.26-dev
// uncompressed version: cartodb.uncompressed.js
// sha: 7b731a6b80264125412e8152769176a64e4e39aa
(function() {
  var root = this;

  // save current libraries
  var __prev = {
    jQuery: root.jQuery,
    $: root.$,
    L: root.L,
    Mustache: root.Mustache,
    Backbone: root.Backbone,
    _: root._
  };

!function (name, context, definition) {
  //if (typeof module !== 'undefined') module.exports = definition(name, context);
  //else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
  //else context[name] = definition(name, context);
  context[name] = definition(name, context);
}('bean', this, function (name, context) {
  var win = window
    , old = context[name]
    , overOut = /over|out/
    , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
    , nameRegex = /\..*/
    , addEvent = 'addEventListener'
    , attachEvent = 'attachEvent'
    , removeEvent = 'removeEventListener'
    , detachEvent = 'detachEvent'
    , doc = document || {}
    , root = doc.documentElement || {}
    , W3C_MODEL = root[addEvent]
    , eventSupport = W3C_MODEL ? addEvent : attachEvent
    , slice = Array.prototype.slice
    , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
    , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
    , textTypeRegex = /^text/i
    , touchTypeRegex = /^touch|^gesture/i
    , ONE = { one: 1 } // singleton for quick matching making add() do one()

    , nativeEvents = (function (hash, events, i) {
        for (i = 0; i < events.length; i++)
          hash[events[i]] = 1
        return hash
      })({}, (
          'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
          'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
          'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
          'keydown keypress keyup ' +                                        // keyboard
          'orientationchange ' +                                             // mobile
          'focus blur change reset select submit ' +                         // form elements
          'load unload beforeunload resize move DOMContentLoaded readystatechange ' + // window
          'error abort scroll ' +                                            // misc
          (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                       // that doesn't actually exist, so make sure we only do these on newer browsers
            'show ' +                                                          // mouse buttons
            'input invalid ' +                                                 // form elements
            'touchstart touchmove touchend touchcancel ' +                     // touch
            'gesturestart gesturechange gestureend ' +                         // gesture
            'MSPointerUp MSPointerDown MSPointerCancel MSPointerMove ' +       // MS Pointer events
            'MSPointerOver MSPointerOut ' +                                    // MS Pointer events
            'message readystatechange pageshow pagehide popstate ' +           // window
            'hashchange offline online ' +                                     // window
            'afterprint beforeprint ' +                                        // printing
            'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
            'loadstart progress suspend emptied stalled loadmetadata ' +       // media
            'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
            'seeked ended durationchange timeupdate play pause ratechange ' +  // media
            'volumechange cuechange ' +                                        // media
            'checking noupdate downloading cached updateready obsolete ' +     // appcache
            '' : '')
        ).split(' ')
      )

    , customEvents = (function () {
        function isDescendant(parent, node) {
          while ((node = node.parentNode) !== null) {
            if (node === parent) return true
          }
          return false
        }

        function check(event) {
          var related = event.relatedTarget
          if (!related) return related === null
          return (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isDescendant(this, related))
        }

        return {
            mouseenter: { base: 'mouseover', condition: check }
          , mouseleave: { base: 'mouseout', condition: check }
          , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
        }
      })()

    , fixEvent = (function () {
        var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
          , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
          , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
          , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
          , textProps = commonProps.concat(['data'])
          , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
          , preventDefault = 'preventDefault'
          , createPreventDefault = function (event) {
              return function () {
                if (event[preventDefault])
                  event[preventDefault]()
                else
                  event.returnValue = false
              }
            }
          , stopPropagation = 'stopPropagation'
          , createStopPropagation = function (event) {
              return function () {
                if (event[stopPropagation])
                  event[stopPropagation]()
                else
                  event.cancelBubble = true
              }
            }
          , createStop = function (synEvent) {
              return function () {
                synEvent[preventDefault]()
                synEvent[stopPropagation]()
                synEvent.stopped = true
              }
            }
          , copyProps = function (event, result, props) {
              var i, p
              for (i = props.length; i--;) {
                p = props[i]
                if (!(p in result) && p in event) result[p] = event[p]
              }
            }

        return function (event, isNative) {
          var result = { originalEvent: event, isNative: isNative }
          if (!event)
            return result

          var props
            , type = event.type
            , target = event.target || event.srcElement

          result[preventDefault] = createPreventDefault(event)
          result[stopPropagation] = createStopPropagation(event)
          result.stop = createStop(result)
          result.target = target && target.nodeType === 3 ? target.parentNode : target

          if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
            if (type.indexOf('key') !== -1) {
              props = keyProps
              result.keyCode = event.which || event.keyCode
            } else if (mouseTypeRegex.test(type)) {
              props = mouseProps
              result.rightClick = event.which === 3 || event.button === 2
              result.pos = { x: 0, y: 0 }
              if (event.pageX || event.pageY) {
                result.clientX = event.pageX
                result.clientY = event.pageY
              } else if (event.clientX || event.clientY) {
                result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
              }
              if (overOut.test(type))
                result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
            } else if (touchTypeRegex.test(type)) {
              props = touchProps
            } else if (mouseWheelTypeRegex.test(type)) {
              props = mouseWheelProps
            } else if (textTypeRegex.test(type)) {
              props = textProps
            }
            copyProps(event, result, props || commonProps)
          }
          return result
        }
      })()

      // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
    , targetElement = function (element, isNative) {
        return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
      }

      // we use one of these per listener, of any type
    , RegEntry = (function () {
        function entry(element, type, handler, original, namespaces) {
          this.element = element
          this.type = type
          this.handler = handler
          this.original = original
          this.namespaces = namespaces
          this.custom = customEvents[type]
          this.isNative = nativeEvents[type] && element[eventSupport]
          this.eventType = W3C_MODEL || this.isNative ? type : 'propertychange'
          this.customType = !W3C_MODEL && !this.isNative && type
          this.target = targetElement(element, this.isNative)
          this.eventSupport = this.target[eventSupport]
        }

        entry.prototype = {
            // given a list of namespaces, is our entry in any of them?
            inNamespaces: function (checkNamespaces) {
              var i, j
              if (!checkNamespaces)
                return true
              if (!this.namespaces)
                return false
              for (i = checkNamespaces.length; i--;) {
                for (j = this.namespaces.length; j--;) {
                  if (checkNamespaces[i] === this.namespaces[j])
                    return true
                }
              }
              return false
            }

            // match by element, original fn (opt), handler fn (opt)
          , matches: function (checkElement, checkOriginal, checkHandler) {
              return this.element === checkElement &&
                (!checkOriginal || this.original === checkOriginal) &&
                (!checkHandler || this.handler === checkHandler)
            }
        }

        return entry
      })()

    , registry = (function () {
        // our map stores arrays by event type, just because it's better than storing
        // everything in a single array. uses '$' as a prefix for the keys for safety
        var map = {}

          // generic functional search of our registry for matching listeners,
          // `fn` returns false to break out of the loop
          , forAll = function (element, type, original, handler, fn) {
              if (!type || type === '*') {
                // search the whole registry
                for (var t in map) {
                  if (t.charAt(0) === '$')
                    forAll(element, t.substr(1), original, handler, fn)
                }
              } else {
                var i = 0, l, list = map['$' + type], all = element === '*'
                if (!list)
                  return
                for (l = list.length; i < l; i++) {
                  if (all || list[i].matches(element, original, handler))
                    if (!fn(list[i], list, i, type))
                      return
                }
              }
            }

          , has = function (element, type, original) {
              // we're not using forAll here simply because it's a bit slower and this
              // needs to be fast
              var i, list = map['$' + type]
              if (list) {
                for (i = list.length; i--;) {
                  if (list[i].matches(element, original, null))
                    return true
                }
              }
              return false
            }

          , get = function (element, type, original) {
              var entries = []
              forAll(element, type, original, null, function (entry) { return entries.push(entry) })
              return entries
            }

          , put = function (entry) {
              (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
              return entry
            }

          , del = function (entry) {
              forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                list.splice(i, 1)
                if (list.length === 0)
                  delete map['$' + entry.type]
                return false
              })
            }

            // dump all entries, used for onunload
          , entries = function () {
              var t, entries = []
              for (t in map) {
                if (t.charAt(0) === '$')
                  entries = entries.concat(map[t])
              }
              return entries
            }

        return { has: has, get: get, put: put, del: del, entries: entries }
      })()

      // add and remove listeners to DOM elements
    , listener = W3C_MODEL ? function (element, type, fn, add) {
        element[add ? addEvent : removeEvent](type, fn, false)
      } : function (element, type, fn, add, custom) {
        if (custom && add && element['_on' + custom] === null)
          element['_on' + custom] = 0
        element[add ? attachEvent : detachEvent]('on' + type, fn)
      }

    , nativeHandler = function (element, fn, args) {
        return function (event) {
          event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, true)
          return fn.apply(element, [event].concat(args))
        }
      }

    , customHandler = function (element, fn, type, condition, args, isNative) {
        return function (event) {
          if (condition ? condition.apply(this, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
            if (event)
              event = fixEvent(event || ((this.ownerDocument || this.document || this).parentWindow || win).event, isNative)
            fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
          }
        }
      }

    , once = function (rm, element, type, fn, originalFn) {
        // wrap the handler in a handler that does a remove as well
        return function () {
          rm(element, type, originalFn)
          fn.apply(this, arguments)
        }
      }

    , removeListener = function (element, orgType, handler, namespaces) {
        var i, l, entry
          , type = (orgType && orgType.replace(nameRegex, ''))
          , handlers = registry.get(element, type, handler)

        for (i = 0, l = handlers.length; i < l; i++) {
          if (handlers[i].inNamespaces(namespaces)) {
            if ((entry = handlers[i]).eventSupport)
              listener(entry.target, entry.eventType, entry.handler, false, entry.type)
            // TODO: this is problematic, we have a registry.get() and registry.del() that
            // both do registry searches so we waste cycles doing this. Needs to be rolled into
            // a single registry.forAll(fn) that removes while finding, but the catch is that
            // we'll be splicing the arrays that we're iterating over. Needs extra tests to
            // make sure we don't screw it up. @rvagg
            registry.del(entry)
          }
        }
      }

    , addListener = function (element, orgType, fn, originalFn, args) {
        var entry
          , type = orgType.replace(nameRegex, '')
          , namespaces = orgType.replace(namespaceRegex, '').split('.')

        if (registry.has(element, type, fn))
          return element // no dupe
        if (type === 'unload')
          fn = once(removeListener, element, type, fn, originalFn) // self clean-up
        if (customEvents[type]) {
          if (customEvents[type].condition)
            fn = customHandler(element, fn, type, customEvents[type].condition, true)
          type = customEvents[type].base || type
        }
        entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
        entry.handler = entry.isNative ?
          nativeHandler(element, entry.handler, args) :
          customHandler(element, entry.handler, type, false, args, false)
        if (entry.eventSupport)
          listener(entry.target, entry.eventType, entry.handler, true, entry.customType)
      }

    , del = function (selector, fn, $) {
        return function (e) {
          var target, i, array = typeof selector === 'string' ? $(selector, this) : selector
          for (target = e.target; target && target !== this; target = target.parentNode) {
            for (i = array.length; i--;) {
              if (array[i] === target) {
                return fn.apply(target, arguments)
              }
            }
          }
        }
      }

    , remove = function (element, typeSpec, fn) {
        var k, m, type, namespaces, i
          , rm = removeListener
          , isString = typeSpec && typeof typeSpec === 'string'

        if (isString && typeSpec.indexOf(' ') > 0) {
          // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
          typeSpec = typeSpec.split(' ')
          for (i = typeSpec.length; i--;)
            remove(element, typeSpec[i], fn)
          return element
        }
        type = isString && typeSpec.replace(nameRegex, '')
        if (type && customEvents[type])
          type = customEvents[type].type
        if (!typeSpec || isString) {
          // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
          if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
            namespaces = namespaces.split('.')
          rm(element, type, fn, namespaces)
        } else if (typeof typeSpec === 'function') {
          // remove(el, fn)
          rm(element, null, typeSpec)
        } else {
          // remove(el, { t1: fn1, t2, fn2 })
          for (k in typeSpec) {
            if (typeSpec.hasOwnProperty(k))
              remove(element, k, typeSpec[k])
          }
        }
        return element
      }

    , add = function (element, events, fn, delfn, $) {
        var type, types, i, args
          , originalFn = fn
          , isDel = fn && typeof fn === 'string'

        if (events && !fn && typeof events === 'object') {
          for (type in events) {
            if (events.hasOwnProperty(type))
              add.apply(this, [ element, type, events[type] ])
          }
        } else {
          args = arguments.length > 3 ? slice.call(arguments, 3) : []
          types = (isDel ? fn : events).split(' ')
          isDel && (fn = del(events, (originalFn = delfn), $)) && (args = slice.call(args, 1))
          // special case for one()
          this === ONE && (fn = once(remove, element, events, fn, originalFn))
          for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
        }
        return element
      }

    , one = function () {
        return add.apply(ONE, arguments)
      }

    , fireListener = W3C_MODEL ? function (isNative, type, element) {
        var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
        evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
        element.dispatchEvent(evt)
      } : function (isNative, type, element) {
        element = targetElement(element, isNative)
        // if not-native then we're using onpropertychange so we just increment a custom property
        isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
      }

    , fire = function (element, type, args) {
        var i, j, l, names, handlers
          , types = type.split(' ')

        for (i = types.length; i--;) {
          type = types[i].replace(nameRegex, '')
          if (names = types[i].replace(namespaceRegex, ''))
            names = names.split('.')
          if (!names && !args && element[eventSupport]) {
            fireListener(nativeEvents[type], type, element)
          } else {
            // non-native event, either because of a namespace, arguments or a non DOM element
            // iterate over all listeners and manually 'fire'
            handlers = registry.get(element, type)
            args = [false].concat(args)
            for (j = 0, l = handlers.length; j < l; j++) {
              if (handlers[j].inNamespaces(names))
                handlers[j].handler.apply(element, args)
            }
          }
        }
        return element
      }

    , clone = function (element, from, type) {
        var i = 0
          , handlers = registry.get(from, type)
          , l = handlers.length

        for (;i < l; i++)
          handlers[i].original && add(element, handlers[i].type, handlers[i].original)
        return element
      }

    , bean = {
          add: add
        , one: one
        , remove: remove
        , clone: clone
        , fire: fire
        , noConflict: function () {
            context[name] = old
            return this
          }
      }

  if (win[attachEvent]) {
    // for IE, clean up on unload to avoid leaks
    var cleanup = function () {
      var i, entries = registry.entries()
      for (i in entries) {
        if (entries[i].type && entries[i].type !== 'unload')
          remove(entries[i].element, entries[i].type)
      }
      win[detachEvent]('onunload', cleanup)
      win.CollectGarbage && win.CollectGarbage()
    }
    win[attachEvent]('onunload', cleanup)
  }

  return bean
})
// Copyright Google Inc.
// Licensed under the Apache Licence Version 2.0
// Autogenerated at Tue Oct 11 13:36:46 EDT 2011
// @provides html4
var html4 = {};
html4.atype = {
  NONE: 0,
  URI: 1,
  URI_FRAGMENT: 11,
  SCRIPT: 2,
  STYLE: 3,
  ID: 4,
  IDREF: 5,
  IDREFS: 6,
  GLOBAL_NAME: 7,
  LOCAL_NAME: 8,
  CLASSES: 9,
  FRAME_TARGET: 10
};
html4.ATTRIBS = {
  '*::class': 9,
  '*::dir': 0,
  '*::id': 4,
  '*::lang': 0,
  '*::onclick': 2,
  '*::ondblclick': 2,
  '*::onkeydown': 2,
  '*::onkeypress': 2,
  '*::onkeyup': 2,
  '*::onload': 2,
  '*::onmousedown': 2,
  '*::onmousemove': 2,
  '*::onmouseout': 2,
  '*::onmouseover': 2,
  '*::onmouseup': 2,
  '*::style': 3,
  '*::title': 0,
  'a::accesskey': 0,
  'a::coords': 0,
  'a::href': 1,
  'a::hreflang': 0,
  'a::name': 7,
  'a::onblur': 2,
  'a::onfocus': 2,
  'a::rel': 0,
  'a::rev': 0,
  'a::shape': 0,
  'a::tabindex': 0,
  'a::target': 10,
  'a::type': 0,
  'area::accesskey': 0,
  'area::alt': 0,
  'area::coords': 0,
  'area::href': 1,
  'area::nohref': 0,
  'area::onblur': 2,
  'area::onfocus': 2,
  'area::shape': 0,
  'area::tabindex': 0,
  'area::target': 10,
  'bdo::dir': 0,
  'blockquote::cite': 1,
  'br::clear': 0,
  'button::accesskey': 0,
  'button::disabled': 0,
  'button::name': 8,
  'button::onblur': 2,
  'button::onfocus': 2,
  'button::tabindex': 0,
  'button::type': 0,
  'button::value': 0,
  'canvas::height': 0,
  'canvas::width': 0,
  'caption::align': 0,
  'col::align': 0,
  'col::char': 0,
  'col::charoff': 0,
  'col::span': 0,
  'col::valign': 0,
  'col::width': 0,
  'colgroup::align': 0,
  'colgroup::char': 0,
  'colgroup::charoff': 0,
  'colgroup::span': 0,
  'colgroup::valign': 0,
  'colgroup::width': 0,
  'del::cite': 1,
  'del::datetime': 0,
  'dir::compact': 0,
  'div::align': 0,
  'dl::compact': 0,
  'font::color': 0,
  'font::face': 0,
  'font::size': 0,
  'form::accept': 0,
  'form::action': 1,
  'form::autocomplete': 0,
  'form::enctype': 0,
  'form::method': 0,
  'form::name': 7,
  'form::onreset': 2,
  'form::onsubmit': 2,
  'form::target': 10,
  'h1::align': 0,
  'h2::align': 0,
  'h3::align': 0,
  'h4::align': 0,
  'h5::align': 0,
  'h6::align': 0,
  'hr::align': 0,
  'hr::noshade': 0,
  'hr::size': 0,
  'hr::width': 0,
  'iframe::align': 0,
  'iframe::frameborder': 0,
  'iframe::height': 0,
  'iframe::marginheight': 0,
  'iframe::marginwidth': 0,
  'iframe::width': 0,
  'img::align': 0,
  'img::alt': 0,
  'img::border': 0,
  'img::height': 0,
  'img::hspace': 0,
  'img::ismap': 0,
  'img::name': 7,
  'img::src': 1,
  'img::usemap': 11,
  'img::vspace': 0,
  'img::width': 0,
  'input::accept': 0,
  'input::accesskey': 0,
  'input::align': 0,
  'input::alt': 0,
  'input::autocomplete': 0,
  'input::checked': 0,
  'input::disabled': 0,
  'input::ismap': 0,
  'input::maxlength': 0,
  'input::name': 8,
  'input::onblur': 2,
  'input::onchange': 2,
  'input::onfocus': 2,
  'input::onselect': 2,
  'input::readonly': 0,
  'input::size': 0,
  'input::src': 1,
  'input::tabindex': 0,
  'input::type': 0,
  'input::usemap': 11,
  'input::value': 0,
  'ins::cite': 1,
  'ins::datetime': 0,
  'label::accesskey': 0,
  'label::for': 5,
  'label::onblur': 2,
  'label::onfocus': 2,
  'legend::accesskey': 0,
  'legend::align': 0,
  'li::type': 0,
  'li::value': 0,
  'map::name': 7,
  'menu::compact': 0,
  'ol::compact': 0,
  'ol::start': 0,
  'ol::type': 0,
  'optgroup::disabled': 0,
  'optgroup::label': 0,
  'option::disabled': 0,
  'option::label': 0,
  'option::selected': 0,
  'option::value': 0,
  'p::align': 0,
  'pre::width': 0,
  'q::cite': 1,
  'select::disabled': 0,
  'select::multiple': 0,
  'select::name': 8,
  'select::onblur': 2,
  'select::onchange': 2,
  'select::onfocus': 2,
  'select::size': 0,
  'select::tabindex': 0,
  'table::align': 0,
  'table::bgcolor': 0,
  'table::border': 0,
  'table::cellpadding': 0,
  'table::cellspacing': 0,
  'table::frame': 0,
  'table::rules': 0,
  'table::summary': 0,
  'table::width': 0,
  'tbody::align': 0,
  'tbody::char': 0,
  'tbody::charoff': 0,
  'tbody::valign': 0,
  'td::abbr': 0,
  'td::align': 0,
  'td::axis': 0,
  'td::bgcolor': 0,
  'td::char': 0,
  'td::charoff': 0,
  'td::colspan': 0,
  'td::headers': 6,
  'td::height': 0,
  'td::nowrap': 0,
  'td::rowspan': 0,
  'td::scope': 0,
  'td::valign': 0,
  'td::width': 0,
  'textarea::accesskey': 0,
  'textarea::cols': 0,
  'textarea::disabled': 0,
  'textarea::name': 8,
  'textarea::onblur': 2,
  'textarea::onchange': 2,
  'textarea::onfocus': 2,
  'textarea::onselect': 2,
  'textarea::readonly': 0,
  'textarea::rows': 0,
  'textarea::tabindex': 0,
  'tfoot::align': 0,
  'tfoot::char': 0,
  'tfoot::charoff': 0,
  'tfoot::valign': 0,
  'th::abbr': 0,
  'th::align': 0,
  'th::axis': 0,
  'th::bgcolor': 0,
  'th::char': 0,
  'th::charoff': 0,
  'th::colspan': 0,
  'th::headers': 6,
  'th::height': 0,
  'th::nowrap': 0,
  'th::rowspan': 0,
  'th::scope': 0,
  'th::valign': 0,
  'th::width': 0,
  'thead::align': 0,
  'thead::char': 0,
  'thead::charoff': 0,
  'thead::valign': 0,
  'tr::align': 0,
  'tr::bgcolor': 0,
  'tr::char': 0,
  'tr::charoff': 0,
  'tr::valign': 0,
  'ul::compact': 0,
  'ul::type': 0
};
html4.eflags = {
  OPTIONAL_ENDTAG: 1,
  EMPTY: 2,
  CDATA: 4,
  RCDATA: 8,
  UNSAFE: 16,
  FOLDABLE: 32,
  SCRIPT: 64,
  STYLE: 128
};
html4.ELEMENTS = {
  'a': 0,
  'abbr': 0,
  'acronym': 0,
  'address': 0,
  'applet': 16,
  'area': 2,
  'b': 0,
  'base': 18,
  'basefont': 18,
  'bdo': 0,
  'big': 0,
  'blockquote': 0,
  'body': 49,
  'br': 2,
  'button': 0,
  'canvas': 0,
  'caption': 0,
  'center': 0,
  'cite': 0,
  'code': 0,
  'col': 2,
  'colgroup': 1,
  'dd': 1,
  'del': 0,
  'dfn': 0,
  'dir': 0,
  'div': 0,
  'dl': 0,
  'dt': 1,
  'em': 0,
  'fieldset': 0,
  'font': 0,
  'form': 0,
  'frame': 18,
  'frameset': 16,
  'h1': 0,
  'h2': 0,
  'h3': 0,
  'h4': 0,
  'h5': 0,
  'h6': 0,
  'head': 49,
  'hr': 2,
  'html': 49,
  'i': 0,
  'iframe': 4,
  'img': 2,
  'input': 2,
  'ins': 0,
  'isindex': 18,
  'kbd': 0,
  'label': 0,
  'legend': 0,
  'li': 1,
  'link': 18,
  'map': 0,
  'menu': 0,
  'meta': 18,
  'nobr': 0,
  'noembed': 4,
  'noframes': 20,
  'noscript': 20,
  'object': 16,
  'ol': 0,
  'optgroup': 0,
  'option': 1,
  'p': 1,
  'param': 18,
  'pre': 0,
  'q': 0,
  's': 0,
  'samp': 0,
  'script': 84,
  'select': 0,
  'small': 0,
  'span': 0,
  'strike': 0,
  'strong': 0,
  'style': 148,
  'sub': 0,
  'sup': 0,
  'table': 0,
  'tbody': 1,
  'td': 1,
  'textarea': 8,
  'tfoot': 1,
  'th': 1,
  'thead': 1,
  'title': 24,
  'tr': 1,
  'tt': 0,
  'u': 0,
  'ul': 0,
  'var': 0
};
html4.ueffects = {
  NOT_LOADED: 0,
  SAME_DOCUMENT: 1,
  NEW_DOCUMENT: 2
};
html4.URIEFFECTS = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 0,
  'body::background': 1,
  'del::cite': 0,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 0,
  'q::cite': 0
};
html4.ltypes = {
  UNSANDBOXED: 2,
  SANDBOXED: 1,
  DATA: 0
};
html4.LOADERTYPES = {
  'a::href': 2,
  'area::href': 2,
  'blockquote::cite': 2,
  'body::background': 1,
  'del::cite': 2,
  'form::action': 2,
  'img::src': 1,
  'input::src': 1,
  'ins::cite': 2,
  'q::cite': 2
};;
// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * An HTML sanitizer that can satisfy a variety of security policies.
 *
 * <p>
 * The HTML sanitizer is built around a SAX parser and HTML element and
 * attributes schemas.
 *
 * @author mikesamuel@gmail.com
 * @requires html4
 * @overrides window
 * @provides html, html_sanitize
 */

/**
 * @namespace
 */
var html = (function (html4) {
  var lcase;
  // The below may not be true on browsers in the Turkish locale.
  if ('script' === 'SCRIPT'.toLowerCase()) {
    lcase = function (s) { return s.toLowerCase(); };
  } else {
    /**
     * {@updoc
     * $ lcase('SCRIPT')
     * # 'script'
     * $ lcase('script')
     * # 'script'
     * }
     */
    lcase = function (s) {
      return s.replace(
          /[A-Z]/g,
          function (ch) {
            return String.fromCharCode(ch.charCodeAt(0) | 32);
          });
    };
  }

  var ENTITIES = {
    lt   : '<',
    gt   : '>',
    amp  : '&',
    nbsp : '\240',
    quot : '"',
    apos : '\''
  };
  
  // Schemes on which to defer to uripolicy. Urls with other schemes are denied
  var WHITELISTED_SCHEMES = /^(?:https?|mailto|data)$/i;

  var decimalEscapeRe = /^#(\d+)$/;
  var hexEscapeRe = /^#x([0-9A-Fa-f]+)$/;
  /**
   * Decodes an HTML entity.
   *
   * {@updoc
   * $ lookupEntity('lt')
   * # '<'
   * $ lookupEntity('GT')
   * # '>'
   * $ lookupEntity('amp')
   * # '&'
   * $ lookupEntity('nbsp')
   * # '\xA0'
   * $ lookupEntity('apos')
   * # "'"
   * $ lookupEntity('quot')
   * # '"'
   * $ lookupEntity('#xa')
   * # '\n'
   * $ lookupEntity('#10')
   * # '\n'
   * $ lookupEntity('#x0a')
   * # '\n'
   * $ lookupEntity('#010')
   * # '\n'
   * $ lookupEntity('#x00A')
   * # '\n'
   * $ lookupEntity('Pi')      // Known failure
   * # '\u03A0'
   * $ lookupEntity('pi')      // Known failure
   * # '\u03C0'
   * }
   *
   * @param name the content between the '&' and the ';'.
   * @return a single unicode code-point as a string.
   */
  function lookupEntity(name) {
    name = lcase(name);  // TODO: &pi; is different from &Pi;
    if (ENTITIES.hasOwnProperty(name)) { return ENTITIES[name]; }
    var m = name.match(decimalEscapeRe);
    if (m) {
      return String.fromCharCode(parseInt(m[1], 10));
    } else if (!!(m = name.match(hexEscapeRe))) {
      return String.fromCharCode(parseInt(m[1], 16));
    }
    return '';
  }

  function decodeOneEntity(_, name) {
    return lookupEntity(name);
  }

  var nulRe = /\0/g;
  function stripNULs(s) {
    return s.replace(nulRe, '');
  }

  var entityRe = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;
  /**
   * The plain text of a chunk of HTML CDATA which possibly containing.
   *
   * {@updoc
   * $ unescapeEntities('')
   * # ''
   * $ unescapeEntities('hello World!')
   * # 'hello World!'
   * $ unescapeEntities('1 &lt; 2 &amp;&AMP; 4 &gt; 3&#10;')
   * # '1 < 2 && 4 > 3\n'
   * $ unescapeEntities('&lt;&lt <- unfinished entity&gt;')
   * # '<&lt <- unfinished entity>'
   * $ unescapeEntities('/foo?bar=baz&copy=true')  // & often unescaped in URLS
   * # '/foo?bar=baz&copy=true'
   * $ unescapeEntities('pi=&pi;&#x3c0;, Pi=&Pi;\u03A0') // FIXME: known failure
   * # 'pi=\u03C0\u03c0, Pi=\u03A0\u03A0'
   * }
   *
   * @param s a chunk of HTML CDATA.  It must not start or end inside an HTML
   *   entity.
   */
  function unescapeEntities(s) {
    return s.replace(entityRe, decodeOneEntity);
  }

  var ampRe = /&/g;
  var looseAmpRe = /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;
  var ltRe = /</g;
  var gtRe = />/g;
  var quotRe = /\"/g;
  var eqRe = /\=/g;  // Backslash required on JScript.net

  /**
   * Escapes HTML special characters in attribute values as HTML entities.
   *
   * {@updoc
   * $ escapeAttrib('')
   * # ''
   * $ escapeAttrib('"<<&==&>>"')  // Do not just escape the first occurrence.
   * # '&#34;&lt;&lt;&amp;&#61;&#61;&amp;&gt;&gt;&#34;'
   * $ escapeAttrib('Hello <World>!')
   * # 'Hello &lt;World&gt;!'
   * }
   */
  function escapeAttrib(s) {
    // Escaping '=' defangs many UTF-7 and SGML short-tag attacks.
    return s.replace(ampRe, '&amp;').replace(ltRe, '&lt;').replace(gtRe, '&gt;')
        .replace(quotRe, '&#34;').replace(eqRe, '&#61;');
  }

  /**
   * Escape entities in RCDATA that can be escaped without changing the meaning.
   * {@updoc
   * $ normalizeRCData('1 < 2 &&amp; 3 > 4 &amp;& 5 &lt; 7&8')
   * # '1 &lt; 2 &amp;&amp; 3 &gt; 4 &amp;&amp; 5 &lt; 7&amp;8'
   * }
   */
  function normalizeRCData(rcdata) {
    return rcdata
        .replace(looseAmpRe, '&amp;$1')
        .replace(ltRe, '&lt;')
        .replace(gtRe, '&gt;');
  }


  // TODO(mikesamuel): validate sanitizer regexs against the HTML5 grammar at
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/syntax.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tokenization.html
  // http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html

  /** token definitions. */
  var INSIDE_TAG_TOKEN = new RegExp(
      // Don't capture space.
      '^\\s*(?:'
      // Capture an attribute name in group 1, and value in group 3.
      // We capture the fact that there was an attribute in group 2, since
      // interpreters are inconsistent in whether a group that matches nothing
      // is null, undefined, or the empty string.
      + ('(?:'
         + '([a-z][a-z-]*)'                    // attribute name
         + ('('                                // optionally followed
            + '\\s*=\\s*'
            + ('('
               // A double quoted string.
               + '\"[^\"]*\"'
               // A single quoted string.
               + '|\'[^\']*\''
               // The positive lookahead is used to make sure that in
               // <foo bar= baz=boo>, the value for bar is blank, not "baz=boo".
               + '|(?=[a-z][a-z-]*\\s*=)'
               // An unquoted value that is not an attribute name.
               // We know it is not an attribute name because the previous
               // zero-width match would've eliminated that possibility.
               + '|[^>\"\'\\s]*'
               + ')'
               )
            + ')'
            ) + '?'
         + ')'
         )
      // End of tag captured in group 3.
      + '|(\/?>)'
      // Don't capture cruft
      + '|[\\s\\S][^a-z\\s>]*)',
      'i');

  var OUTSIDE_TAG_TOKEN = new RegExp(
      '^(?:'
      // Entity captured in group 1.
      + '&(\\#[0-9]+|\\#[x][0-9a-f]+|\\w+);'
      // Comment, doctypes, and processing instructions not captured.
      + '|<\!--[\\s\\S]*?--\>|<!\\w[^>]*>|<\\?[^>*]*>'
      // '/' captured in group 2 for close tags, and name captured in group 3.
      + '|<(\/)?([a-z][a-z0-9]*)'
      // Text captured in group 4.
      + '|([^<&>]+)'
      // Cruft captured in group 5.
      + '|([<&>]))',
      'i');

  /**
   * Given a SAX-like event handler, produce a function that feeds those
   * events and a parameter to the event handler.
   *
   * The event handler has the form:{@code
   * {
   *   // Name is an upper-case HTML tag name.  Attribs is an array of
   *   // alternating upper-case attribute names, and attribute values.  The
   *   // attribs array is reused by the parser.  Param is the value passed to
   *   // the saxParser.
   *   startTag: function (name, attribs, param) { ... },
   *   endTag:   function (name, param) { ... },
   *   pcdata:   function (text, param) { ... },
   *   rcdata:   function (text, param) { ... },
   *   cdata:    function (text, param) { ... },
   *   startDoc: function (param) { ... },
   *   endDoc:   function (param) { ... }
   * }}
   *
   * @param {Object} handler a record containing event handlers.
   * @return {Function} that takes a chunk of html and a parameter.
   *   The parameter is passed on to the handler methods.
   */
  function makeSaxParser(handler) {
    return function parse(htmlText, param) {
      htmlText = String(htmlText);
      var htmlLower = null;

      var inTag = false;  // True iff we're currently processing a tag.
      var attribs = [];  // Accumulates attribute names and values.
      var tagName = void 0;  // The name of the tag currently being processed.
      var eflags = void 0;  // The element flags for the current tag.
      var openTag = void 0;  // True if the current tag is an open tag.

      if (handler.startDoc) { handler.startDoc(param); }

      while (htmlText) {
        var m = htmlText.match(inTag ? INSIDE_TAG_TOKEN : OUTSIDE_TAG_TOKEN);
        htmlText = htmlText.substring(m[0].length);

        if (inTag) {
          if (m[1]) { // attribute
            // setAttribute with uppercase names doesn't work on IE6.
            var attribName = lcase(m[1]);
            var decodedValue;
            if (m[2]) {
              var encodedValue = m[3];
              switch (encodedValue.charCodeAt(0)) {  // Strip quotes
                case 34: case 39:
                  encodedValue = encodedValue.substring(
                      1, encodedValue.length - 1);
                  break;
              }
              decodedValue = unescapeEntities(stripNULs(encodedValue));
            } else {
              // Use name as value for valueless attribs, so
              //   <input type=checkbox checked>
              // gets attributes ['type', 'checkbox', 'checked', 'checked']
              decodedValue = attribName;
            }
            attribs.push(attribName, decodedValue);
          } else if (m[4]) {
            if (eflags !== void 0) {  // False if not in whitelist.
              if (openTag) {
                if (handler.startTag) {
                  handler.startTag(tagName, attribs, param);
                }
              } else {
                if (handler.endTag) {
                  handler.endTag(tagName, param);
                }
              }
            }

            if (openTag
                && (eflags & (html4.eflags.CDATA | html4.eflags.RCDATA))) {
              if (htmlLower === null) {
                htmlLower = lcase(htmlText);
              } else {
                htmlLower = htmlLower.substring(
                    htmlLower.length - htmlText.length);
              }
              var dataEnd = htmlLower.indexOf('</' + tagName);
              if (dataEnd < 0) { dataEnd = htmlText.length; }
              if (dataEnd) {
                if (eflags & html4.eflags.CDATA) {
                  if (handler.cdata) {
                    handler.cdata(htmlText.substring(0, dataEnd), param);
                  }
                } else if (handler.rcdata) {
                  handler.rcdata(
                    normalizeRCData(htmlText.substring(0, dataEnd)), param);
                }
                htmlText = htmlText.substring(dataEnd);
              }
            }

            tagName = eflags = openTag = void 0;
            attribs.length = 0;
            inTag = false;
          }
        } else {
          if (m[1]) {  // Entity
            if (handler.pcdata) { handler.pcdata(m[0], param); }
          } else if (m[3]) {  // Tag
            openTag = !m[2];
            inTag = true;
            tagName = lcase(m[3]);
            eflags = html4.ELEMENTS.hasOwnProperty(tagName)
                ? html4.ELEMENTS[tagName] : void 0;
          } else if (m[4]) {  // Text
            if (handler.pcdata) { handler.pcdata(m[4], param); }
          } else if (m[5]) {  // Cruft
            if (handler.pcdata) {
              var ch = m[5];
              handler.pcdata(
                  ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : '&amp;',
                  param);
            }
          }
        }
      }

      if (handler.endDoc) { handler.endDoc(param); }
    };
  }

  /**
   * Returns a function that strips unsafe tags and attributes from html.
   * @param {Function} sanitizeAttributes
   *     maps from (tagName, attribs[]) to null or a sanitized attribute array.
   *     The attribs array can be arbitrarily modified, but the same array
   *     instance is reused, so should not be held.
   * @return {Function} from html to sanitized html
   */
  function makeHtmlSanitizer(sanitizeAttributes) {
    var stack;
    var ignoring;
    return makeSaxParser({
        startDoc: function (_) {
          stack = [];
          ignoring = false;
        },
        startTag: function (tagName, attribs, out) {
          if (ignoring) { return; }
          if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
          var eflags = html4.ELEMENTS[tagName];
          if (eflags & html4.eflags.FOLDABLE) {
            return;
          } else if (eflags & html4.eflags.UNSAFE) {
            ignoring = !(eflags & html4.eflags.EMPTY);
            return;
          }
          attribs = sanitizeAttributes(tagName, attribs);
          // TODO(mikesamuel): relying on sanitizeAttributes not to
          // insert unsafe attribute names.
          if (attribs) {
            if (!(eflags & html4.eflags.EMPTY)) {
              stack.push(tagName);
            }

            out.push('<', tagName);
            for (var i = 0, n = attribs.length; i < n; i += 2) {
              var attribName = attribs[i],
                  value = attribs[i + 1];
              if (value !== null && value !== void 0) {
                out.push(' ', attribName, '="', escapeAttrib(value), '"');
              }
            }
            out.push('>');
          }
        },
        endTag: function (tagName, out) {
          if (ignoring) {
            ignoring = false;
            return;
          }
          if (!html4.ELEMENTS.hasOwnProperty(tagName)) { return; }
          var eflags = html4.ELEMENTS[tagName];
          if (!(eflags & (html4.eflags.UNSAFE | html4.eflags.EMPTY
                          | html4.eflags.FOLDABLE))) {
            var index;
            if (eflags & html4.eflags.OPTIONAL_ENDTAG) {
              for (index = stack.length; --index >= 0;) {
                var stackEl = stack[index];
                if (stackEl === tagName) { break; }
                if (!(html4.ELEMENTS[stackEl]
                      & html4.eflags.OPTIONAL_ENDTAG)) {
                  // Don't pop non optional end tags looking for a match.
                  return;
                }
              }
            } else {
              for (index = stack.length; --index >= 0;) {
                if (stack[index] === tagName) { break; }
              }
            }
            if (index < 0) { return; }  // Not opened.
            for (var i = stack.length; --i > index;) {
              var stackEl = stack[i];
              if (!(html4.ELEMENTS[stackEl]
                    & html4.eflags.OPTIONAL_ENDTAG)) {
                out.push('</', stackEl, '>');
              }
            }
            stack.length = index;
            out.push('</', tagName, '>');
          }
        },
        pcdata: function (text, out) {
          if (!ignoring) { out.push(text); }
        },
        rcdata: function (text, out) {
          if (!ignoring) { out.push(text); }
        },
        cdata: function (text, out) {
          if (!ignoring) { out.push(text); }
        },
        endDoc: function (out) {
          for (var i = stack.length; --i >= 0;) {
            out.push('</', stack[i], '>');
          }
          stack.length = 0;
        }
      });
  }

  // From RFC3986
  var URI_SCHEME_RE = new RegExp(
        "^" +
      "(?:" +
        "([^:\/?#]+)" +         // scheme
      ":)?"
      );

  /**
   * Strips unsafe tags and attributes from html.
   * @param {string} htmlText to sanitize
   * @param {Function} opt_uriPolicy -- a transform to apply to uri/url
   *     attribute values.  If no opt_uriPolicy is provided, no uris
   *     are allowed ie. the default uriPolicy rewrites all uris to null
   * @param {Function} opt_nmTokenPolicy : string -> string? -- a transform to
   *     apply to names, ids, and classes. If no opt_nmTokenPolicy is provided,
   *     all names, ids and classes are passed through ie. the default
   *     nmTokenPolicy is an identity transform
   * @return {string} html
   */
  function sanitize(htmlText, opt_uriPolicy, opt_nmTokenPolicy) {
    var out = [];
    makeHtmlSanitizer(
      function sanitizeAttribs(tagName, attribs) {
        for (var i = 0; i < attribs.length; i += 2) {
          var attribName = attribs[i];
          var value = attribs[i + 1];
          var atype = null, attribKey;
          if ((attribKey = tagName + '::' + attribName,
               html4.ATTRIBS.hasOwnProperty(attribKey))
              || (attribKey = '*::' + attribName,
                  html4.ATTRIBS.hasOwnProperty(attribKey))) {
            atype = html4.ATTRIBS[attribKey];
          }
          if (atype !== null) {
            switch (atype) {
              case html4.atype.NONE: break;
              case html4.atype.SCRIPT:
              case html4.atype.STYLE:
                value = null;
                break;
              case html4.atype.ID:
              case html4.atype.IDREF:
              case html4.atype.IDREFS:
              case html4.atype.GLOBAL_NAME:
              case html4.atype.LOCAL_NAME:
              case html4.atype.CLASSES:
                value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                break;
              case html4.atype.URI:
                var parsedUri = ('' + value).match(URI_SCHEME_RE);
                if (!parsedUri) {
                  value = null;
                } else if (!parsedUri[1] ||
                    WHITELISTED_SCHEMES.test(parsedUri[1])) {
                  value = opt_uriPolicy && opt_uriPolicy(value);
                } else {
                  value = null;
                }
                break;
              case html4.atype.URI_FRAGMENT:
                if (value && '#' === value.charAt(0)) {
                  value = opt_nmTokenPolicy ? opt_nmTokenPolicy(value) : value;
                  if (value) { value = '#' + value; }
                } else {
                  value = null;
                }
                break;
              default:
                value = null;
                break;
            }
          } else {
            value = null;
          }
          attribs[i + 1] = value;
        }
        return attribs;
      })(htmlText, out);
    return out.join('');
  }

  return {
    escapeAttrib: escapeAttrib,
    makeHtmlSanitizer: makeHtmlSanitizer,
    makeSaxParser: makeSaxParser,
    normalizeRCData: normalizeRCData,
    sanitize: sanitize,
    unescapeEntities: unescapeEntities
  };
})(html4);

var html_sanitize = html.sanitize;

// Exports for closure compiler.  Note this file is also cajoled
// for domado and run in an environment without 'window'
if (typeof window !== 'undefined') {
  window['html'] = html;
  window['html_sanitize'] = html_sanitize;
}
// Loosen restrictions of Caja's
// html-sanitizer to allow for styling
html4.ATTRIBS['*::style'] = 0;
html4.ELEMENTS['style'] = 0;

html4.ATTRIBS['a::target'] = 0;

html4.ELEMENTS['video'] = 0;
html4.ATTRIBS['video::src'] = 0;
html4.ATTRIBS['video::poster'] = 0;
html4.ATTRIBS['video::controls'] = 0;

html4.ELEMENTS['audio'] = 0;
html4.ATTRIBS['audio::src'] = 0;
html4.ATTRIBS['video::autoplay'] = 0;
html4.ATTRIBS['video::controls'] = 0;
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */
var Mustache = (typeof module !== "undefined" && module.exports) || {};

(function (exports) {

  exports.name = "mustache.js";
  exports.version = "0.5.0-dev";
  exports.tags = ["{{", "}}"];
  exports.parse = parse;
  exports.compile = compile;
  exports.render = render;
  exports.clearCache = clearCache;

  // This is here for backwards compatibility with 0.4.x.
  exports.to_html = function (template, view, partials, send) {
    var result = render(template, view, partials);

    if (typeof send === "function") {
      send(result);
    } else {
      return result;
    }
  };

  var _toString = Object.prototype.toString;
  var _isArray = Array.isArray;
  var _forEach = Array.prototype.forEach;
  var _trim = String.prototype.trim;

  var isArray;
  if (_isArray) {
    isArray = _isArray;
  } else {
    isArray = function (obj) {
      return _toString.call(obj) === "[object Array]";
    };
  }

  var forEach;
  if (_forEach) {
    forEach = function (obj, callback, scope) {
      return _forEach.call(obj, callback, scope);
    };
  } else {
    forEach = function (obj, callback, scope) {
      for (var i = 0, len = obj.length; i < len; ++i) {
        callback.call(scope, obj[i], i, obj);
      }
    };
  }

  var spaceRe = /^\s*$/;

  function isWhitespace(string) {
    return spaceRe.test(string);
  }

  var trim;
  if (_trim) {
    trim = function (string) {
      return string == null ? "" : _trim.call(string);
    };
  } else {
    var trimLeft, trimRight;

    if (isWhitespace("\xA0")) {
      trimLeft = /^\s+/;
      trimRight = /\s+$/;
    } else {
      // IE doesn't match non-breaking spaces with \s, thanks jQuery.
      trimLeft = /^[\s\xA0]+/;
      trimRight = /[\s\xA0]+$/;
    }

    trim = function (string) {
      return string == null ? "" :
        String(string).replace(trimLeft, "").replace(trimRight, "");
    };
  }

  var escapeMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return escapeMap[s] || s;
    });
  }

  /**
   * Adds the `template`, `line`, and `file` properties to the given error
   * object and alters the message to provide more useful debugging information.
   */
  function debug(e, template, line, file) {
    file = file || "<template>";

    var lines = template.split("\n"),
        start = Math.max(line - 3, 0),
        end = Math.min(lines.length, line + 3),
        context = lines.slice(start, end);

    var c;
    for (var i = 0, len = context.length; i < len; ++i) {
      c = i + start + 1;
      context[i] = (c === line ? " >> " : "    ") + context[i];
    }

    e.template = template;
    e.line = line;
    e.file = file;
    e.message = [file + ":" + line, context.join("\n"), "", e.message].join("\n");

    return e;
  }

  /**
   * Looks up the value of the given `name` in the given context `stack`.
   */
  function lookup(name, stack, defaultValue) {
    if (name === ".") {
      return stack[stack.length - 1];
    }

    var names = name.split(".");
    var lastIndex = names.length - 1;
    var target = names[lastIndex];

    var value, context, i = stack.length, j, localStack;
    while (i) {
      localStack = stack.slice(0);
      context = stack[--i];

      j = 0;
      while (j < lastIndex) {
        context = context[names[j++]];

        if (context == null) {
          break;
        }

        localStack.push(context);
      }

      if (context && typeof context === "object" && target in context) {
        value = context[target];
        break;
      }
    }

    // If the value is a function, call it in the current context.
    if (typeof value === "function") {
      value = value.call(localStack[localStack.length - 1]);
    }

    if (value == null)  {
      return defaultValue;
    }

    return value;
  }

  function renderSection(name, stack, callback, inverted) {
    var buffer = "";
    var value =  lookup(name, stack);

    if (inverted) {
      // From the spec: inverted sections may render text once based on the
      // inverse value of the key. That is, they will be rendered if the key
      // doesn't exist, is false, or is an empty list.
      if (value == null || value === false || (isArray(value) && value.length === 0)) {
        buffer += callback();
      }
    } else if (isArray(value)) {
      forEach(value, function (value) {
        stack.push(value);
        buffer += callback();
        stack.pop();
      });
    } else if (typeof value === "object") {
      stack.push(value);
      buffer += callback();
      stack.pop();
    } else if (typeof value === "function") {
      var scope = stack[stack.length - 1];
      var scopedRender = function (template) {
        return render(template, scope);
      };
      buffer += value.call(scope, callback(), scopedRender) || "";
    } else if (value) {
      buffer += callback();
    }

    return buffer;
  }

  /**
   * Parses the given `template` and returns the source of a function that,
   * with the proper arguments, will render the template. Recognized options
   * include the following:
   *
   *   - file     The name of the file the template comes from (displayed in
   *              error messages)
   *   - tags     An array of open and close tags the `template` uses. Defaults
   *              to the value of Mustache.tags
   *   - debug    Set `true` to log the body of the generated function to the
   *              console
   *   - space    Set `true` to preserve whitespace from lines that otherwise
   *              contain only a {{tag}}. Defaults to `false`
   */
  function parse(template, options) {
    options = options || {};

    var tags = options.tags || exports.tags,
        openTag = tags[0],
        closeTag = tags[tags.length - 1];

    var code = [
      'var buffer = "";', // output buffer
      "\nvar line = 1;", // keep track of source line number
      "\ntry {",
      '\nbuffer += "'
    ];

    var spaces = [],      // indices of whitespace in code on the current line
        hasTag = false,   // is there a {{tag}} on the current line?
        nonSpace = false; // is there a non-space char on the current line?

    // Strips all space characters from the code array for the current line
    // if there was a {{tag}} on it and otherwise only spaces.
    var stripSpace = function () {
      if (hasTag && !nonSpace && !options.space) {
        while (spaces.length) {
          code.splice(spaces.pop(), 1);
        }
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    };

    var sectionStack = [], updateLine, nextOpenTag, nextCloseTag;

    var setTags = function (source) {
      tags = trim(source).split(/\s+/);
      nextOpenTag = tags[0];
      nextCloseTag = tags[tags.length - 1];
    };

    var includePartial = function (source) {
      code.push(
        '";',
        updateLine,
        '\nvar partial = partials["' + trim(source) + '"];',
        '\nif (partial) {',
        '\n  buffer += render(partial,stack[stack.length - 1],partials);',
        '\n}',
        '\nbuffer += "'
      );
    };

    var openSection = function (source, inverted) {
      var name = trim(source);

      if (name === "") {
        throw debug(new Error("Section name may not be empty"), template, line, options.file);
      }

      sectionStack.push({name: name, inverted: inverted});

      code.push(
        '";',
        updateLine,
        '\nvar name = "' + name + '";',
        '\nvar callback = (function () {',
        '\n  return function () {',
        '\n    var buffer = "";',
        '\nbuffer += "'
      );
    };

    var openInvertedSection = function (source) {
      openSection(source, true);
    };

    var closeSection = function (source) {
      var name = trim(source);
      var openName = sectionStack.length != 0 && sectionStack[sectionStack.length - 1].name;

      if (!openName || name != openName) {
        throw debug(new Error('Section named "' + name + '" was never opened'), template, line, options.file);
      }

      var section = sectionStack.pop();

      code.push(
        '";',
        '\n    return buffer;',
        '\n  };',
        '\n})();'
      );

      if (section.inverted) {
        code.push("\nbuffer += renderSection(name,stack,callback,true);");
      } else {
        code.push("\nbuffer += renderSection(name,stack,callback);");
      }

      code.push('\nbuffer += "');
    };

    var sendPlain = function (source) {
      code.push(
        '";',
        updateLine,
        '\nbuffer += lookup("' + trim(source) + '",stack,"");',
        '\nbuffer += "'
      );
    };

    var sendEscaped = function (source) {
      code.push(
        '";',
        updateLine,
        '\nbuffer += escapeHTML(lookup("' + trim(source) + '",stack,""));',
        '\nbuffer += "'
      );
    };

    var line = 1, c, callback;
    for (var i = 0, len = template.length; i < len; ++i) {
      if (template.slice(i, i + openTag.length) === openTag) {
        i += openTag.length;
        c = template.substr(i, 1);
        updateLine = '\nline = ' + line + ';';
        nextOpenTag = openTag;
        nextCloseTag = closeTag;
        hasTag = true;

        switch (c) {
        case "!": // comment
          i++;
          callback = null;
          break;
        case "=": // change open/close tags, e.g. {{=<% %>=}}
          i++;
          closeTag = "=" + closeTag;
          callback = setTags;
          break;
        case ">": // include partial
          i++;
          callback = includePartial;
          break;
        case "#": // start section
          i++;
          callback = openSection;
          break;
        case "^": // start inverted section
          i++;
          callback = openInvertedSection;
          break;
        case "/": // end section
          i++;
          callback = closeSection;
          break;
        case "{": // plain variable
          closeTag = "}" + closeTag;
          // fall through
        case "&": // plain variable
          i++;
          nonSpace = true;
          callback = sendPlain;
          break;
        default: // escaped variable
          nonSpace = true;
          callback = sendEscaped;
        }

        var end = template.indexOf(closeTag, i);

        if (end === -1) {
          throw debug(new Error('Tag "' + openTag + '" was not closed properly'), template, line, options.file);
        }

        var source = template.substring(i, end);

        if (callback) {
          callback(source);
        }

        // Maintain line count for \n in source.
        var n = 0;
        while (~(n = source.indexOf("\n", n))) {
          line++;
          n++;
        }

        i = end + closeTag.length - 1;
        openTag = nextOpenTag;
        closeTag = nextCloseTag;
      } else {
        c = template.substr(i, 1);

        switch (c) {
        case '"':
        case "\\":
          nonSpace = true;
          code.push("\\" + c);
          break;
        case "\r":
          // Ignore carriage returns.
          break;
        case "\n":
          spaces.push(code.length);
          code.push("\\n");
          stripSpace(); // Check for whitespace on the current line.
          line++;
          break;
        default:
          if (isWhitespace(c)) {
            spaces.push(code.length);
          } else {
            nonSpace = true;
          }

          code.push(c);
        }
      }
    }

    if (sectionStack.length != 0) {
      throw debug(new Error('Section "' + sectionStack[sectionStack.length - 1].name + '" was not closed properly'), template, line, options.file);
    }

    // Clean up any whitespace from a closing {{tag}} that was at the end
    // of the template without a trailing \n.
    stripSpace();

    code.push(
      '";',
      "\nreturn buffer;",
      "\n} catch (e) { throw {error: e, line: line}; }"
    );

    // Ignore `buffer += "";` statements.
    var body = code.join("").replace(/buffer \+= "";\n/g, "");

    if (options.debug) {
      if (typeof console != "undefined" && console.log) {
        console.log(body);
      } else if (typeof print === "function") {
        print(body);
      }
    }

    return body;
  }

  /**
   * Used by `compile` to generate a reusable function for the given `template`.
   */
  function _compile(template, options) {
    var args = "view,partials,stack,lookup,escapeHTML,renderSection,render";
    var body = parse(template, options);
    var fn = new Function(args, body);

    // This anonymous function wraps the generated function so we can do
    // argument coercion, setup some variables, and handle any errors
    // encountered while executing it.
    return function (view, partials) {
      partials = partials || {};

      var stack = [view]; // context stack

      try {
        return fn(view, partials, stack, lookup, escapeHTML, renderSection, render);
      } catch (e) {
        throw debug(e.error, template, e.line, options.file);
      }
    };
  }

  // Cache of pre-compiled templates.
  var _cache = {};

  /**
   * Clear the cache of compiled templates.
   */
  function clearCache() {
    _cache = {};
  }

  /**
   * Compiles the given `template` into a reusable function using the given
   * `options`. In addition to the options accepted by Mustache.parse,
   * recognized options include the following:
   *
   *   - cache    Set `false` to bypass any pre-compiled version of the given
   *              template. Otherwise, a given `template` string will be cached
   *              the first time it is parsed
   */
  function compile(template, options) {
    options = options || {};

    // Use a pre-compiled version from the cache if we have one.
    if (options.cache !== false) {
      if (!_cache[template]) {
        _cache[template] = _compile(template, options);
      }

      return _cache[template];
    }

    return _compile(template, options);
  }

  /**
   * High-level function that renders the given `template` using the given
   * `view` and `partials`. If you need to use any of the template options (see
   * `compile` above), you must compile in a separate step, and then call that
   * compiled function.
   */
  function render(template, view, partials) {
    return compile(template)(view, partials);
  }

})(Mustache);
/*!
  * Reqwest! A general purpose XHR connection manager
  * (c) Dustin Diaz 2012
  * https://github.com/ded/reqwest
  * license MIT
  */
;(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('reqwest', this, function () {

  var win = window
    , doc = document
    , twoHundo = /^20\d$/
    , byTag = 'getElementsByTagName'
    , readyState = 'readyState'
    , contentType = 'Content-Type'
    , requestedWith = 'X-Requested-With'
    , head = doc[byTag]('head')[0]
    , uniqid = 0
    , callbackPrefix = 'reqwest_' + (+new Date())
    , lastValue // data stored by the most recent JSONP callback
    , xmlHttpRequest = 'XMLHttpRequest'
    , noop = function () {}

    , isArray = typeof Array.isArray == 'function'
        ? Array.isArray
        : function (a) {
            return a instanceof Array
          }

    , defaultHeaders = {
          contentType: 'application/x-www-form-urlencoded'
        , requestedWith: xmlHttpRequest
        , accept: {
              '*':  'text/javascript, text/html, application/xml, text/xml, */*'
            , xml:  'application/xml, text/xml'
            , html: 'text/html'
            , text: 'text/plain'
            , json: 'application/json, text/javascript'
            , js:   'application/javascript, text/javascript'
          }
      }

    , xhr = win[xmlHttpRequest]
        ? function () {
            return new XMLHttpRequest()
          }
        : function () {
            return new ActiveXObject('Microsoft.XMLHTTP')
          }

  function handleReadyState (r, success, error) {
    return function () {
      // use _aborted to mitigate against IE err c00c023f
      // (can't read props on aborted request objects)
      if (r._aborted) return error(r.request)
      if (r.request && r.request[readyState] == 4) {
        r.request.onreadystatechange = noop
        if (twoHundo.test(r.request.status))
          success(r.request)
        else
          error(r.request)
      }
    }
  }

  function setHeaders (http, o) {
    var headers = o.headers || {}
      , h

    headers.Accept = headers.Accept
      || defaultHeaders.accept[o.type]
      || defaultHeaders.accept['*']

    // breaks cross-origin requests with legacy browsers
    if (!o.crossOrigin && !headers[requestedWith]) headers[requestedWith] = defaultHeaders.requestedWith
    if (!headers[contentType]) headers[contentType] = o.contentType || defaultHeaders.contentType
    for (h in headers)
      headers.hasOwnProperty(h) && http.setRequestHeader(h, headers[h])
  }

  function setCredentials (http, o) {
    if (typeof o.withCredentials !== 'undefined' && typeof http.withCredentials !== 'undefined') {
      http.withCredentials = !!o.withCredentials
    }
  }

  function generalCallback (data) {
    lastValue = data
  }

  function urlappend (url, s) {
    return url + (/\?/.test(url) ? '&' : '?') + s
  }

  function handleJsonp (o, fn, err, url) {
    var reqId = uniqid++
      , cbkey = o.jsonpCallback || 'callback' // the 'callback' key
      , cbval = o.jsonpCallbackName || reqwest.getcallbackPrefix(reqId)
      // , cbval = o.jsonpCallbackName || ('reqwest_' + reqId) // the 'callback' value
      , cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)')
      , match = url.match(cbreg)
      , script = doc.createElement('script')
      , loaded = 0
      , isIE10 = navigator.userAgent.indexOf('MSIE 10.0') !== -1
      , isIE9 = navigator.userAgent.indexOf('MSIE 9.0') !== -1;

    if (match) {
      if (match[3] === '?') {
        url = url.replace(cbreg, '$1=' + cbval) // wildcard callback func name
      } else {
        cbval = match[3] // provided callback func name
      }
    } else {
      url = urlappend(url, cbkey + '=' + cbval) // no callback details, add 'em
    }

    win[cbval] = generalCallback

    script.type = 'text/javascript'
    script.src = url
    script.async = true
    if (typeof script.onreadystatechange !== 'undefined' && !isIE10 && !isIE9) {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      //
      // if this hack is used in IE10 jsonp callback are never called
      script.event = 'onclick'
      script.htmlFor = script.id = '_reqwest_' + reqId
    }

    script.onload = script.onreadystatechange = function () {
      if ((script[readyState] && script[readyState] !== 'complete' && script[readyState] !== 'loaded') || loaded) {
        return false
      }
      script.onload = script.onreadystatechange = null
      script.onclick && script.onclick()
      // Call the user callback with the last value stored and clean up values and scripts.
      o.success && o.success(lastValue)
      lastValue = undefined
      head.removeChild(script)
      loaded = 1
    }

    // Add the script to the DOM head
    head.appendChild(script)

    // Enable JSONP timeout
    return {
      abort: function () {
        script.onload = script.onreadystatechange = null
        o.error && o.error({}, 'Request is aborted: timeout', {})
        lastValue = undefined
        head.removeChild(script)
        loaded = 1
      }
    }
  }

  function getRequest (fn, err) {
    var o = this.o
      , method = (o.method || 'GET').toUpperCase()
      , url = typeof o === 'string' ? o : o.url
      // convert non-string objects to query-string form unless o.processData is false
      , data = (o.processData !== false && o.data && typeof o.data !== 'string')
        ? reqwest.toQueryString(o.data)
        : (o.data || null)
      , http

    // if we're working on a GET request and we have data then we should append
    // query string to end of URL and not post data
    if ((o.type == 'jsonp' || method == 'GET') && data) {
      url = urlappend(url, data)
      data = null
    }

    if (o.type == 'jsonp') return handleJsonp(o, fn, err, url)

    http = xhr()
    http.open(method, url, true)
    setHeaders(http, o)
    setCredentials(http, o)
    http.onreadystatechange = handleReadyState(this, fn, err)
    o.before && o.before(http)
    http.send(data)
    return http
  }

  function Reqwest (o, fn) {
    this.o = o
    this.fn = fn

    init.apply(this, arguments)
  }

  function setType (url) {
    var m = url.match(/\.(json|jsonp|html|xml)(\?|$)/)
    return m ? m[1] : 'js'
  }

  function init (o, fn) {

    this.url = typeof o == 'string' ? o : o.url
    this.timeout = null

    // whether request has been fulfilled for purpose
    // of tracking the Promises
    this._fulfilled = false
    // success handlers
    this._fulfillmentHandlers = []
    // error handlers
    this._errorHandlers = []
    // complete (both success and fail) handlers
    this._completeHandlers = []
    this._erred = false
    this._responseArgs = {}

    var self = this
      , type = o.type || setType(this.url)

    fn = fn || function () {}

    if (o.timeout) {
      this.timeout = setTimeout(function () {
        self.abort()
      }, o.timeout)
    }

    if (o.success) {
      this._fulfillmentHandlers.push(function () {
        o.success.apply(o, arguments)
      })
    }

    if (o.error) {
      this._errorHandlers.push(function () {
        o.error.apply(o, arguments)
      })
    }

    if (o.complete) {
      this._completeHandlers.push(function () {
        o.complete.apply(o, arguments)
      })
    }

    function complete (resp) {
      o.timeout && clearTimeout(self.timeout)
      self.timeout = null
      while (self._completeHandlers.length > 0) {
        self._completeHandlers.shift()(resp)
      }
    }

    function success (resp) {
      var r = resp.responseText
      if (r) {
        switch (type) {
        case 'json':
          try {
            resp = win.JSON ? win.JSON.parse(r) : eval('(' + r + ')')
          } catch (err) {
            return error(resp, 'Could not parse JSON in response', err)
          }
          break
        case 'js':
          resp = eval(r)
          break
        case 'html':
          resp = r
          break
        case 'xml':
          resp = resp.responseXML
              && resp.responseXML.parseError // IE trololo
              && resp.responseXML.parseError.errorCode
              && resp.responseXML.parseError.reason
            ? null
            : resp.responseXML
          break
        }
      }

      self._responseArgs.resp = resp
      self._fulfilled = true
      fn(resp)
      while (self._fulfillmentHandlers.length > 0) {
        self._fulfillmentHandlers.shift()(resp)
      }

      complete(resp)
    }

    function error (resp, msg, t) {
      self._responseArgs.resp = resp
      self._responseArgs.msg = msg
      self._responseArgs.t = t
      self._erred = true
      while (self._errorHandlers.length > 0) {
        self._errorHandlers.shift()(resp, msg, t)
      }
      complete(resp)
    }

    this.request = getRequest.call(this, success, error)
  }

  Reqwest.prototype = {
    abort: function () {
      this._aborted = true
      this.request.abort()
    }

  , retry: function () {
      init.call(this, this.o, this.fn)
    }

    /**
     * Small deviation from the Promises A CommonJs specification
     * http://wiki.commonjs.org/wiki/Promises/A
     */

    /**
     * `then` will execute upon successful requests
     */
  , then: function (success, fail) {
      if (this._fulfilled) {
        success(this._responseArgs.resp)
      } else if (this._erred) {
        fail(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._fulfillmentHandlers.push(success)
        this._errorHandlers.push(fail)
      }
      return this
    }

    /**
     * `always` will execute whether the request succeeds or fails
     */
  , always: function (fn) {
      if (this._fulfilled || this._erred) {
        fn(this._responseArgs.resp)
      } else {
        this._completeHandlers.push(fn)
      }
      return this
    }

    /**
     * `fail` will execute when the request fails
     */
  , fail: function (fn) {
      if (this._erred) {
        fn(this._responseArgs.resp, this._responseArgs.msg, this._responseArgs.t)
      } else {
        this._errorHandlers.push(fn)
      }
      return this
    }
  }

  function reqwest (o, fn) {
    return new Reqwest(o, fn)
  }

  // normalize newline variants according to spec -> CRLF
  function normalize (s) {
    return s ? s.replace(/\r?\n/g, '\r\n') : ''
  }

  function serial (el, cb) {
    var n = el.name
      , t = el.tagName.toLowerCase()
      , optCb = function (o) {
          // IE gives value="" even where there is no value attribute
          // 'specified' ref: http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-862529273
          if (o && !o.disabled)
            cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text))
        }
      , ch, ra, val, i

    // don't serialize elements that are disabled or without a name
    if (el.disabled || !n) return

    switch (t) {
    case 'input':
      if (!/reset|button|image|file/i.test(el.type)) {
        ch = /checkbox/i.test(el.type)
        ra = /radio/i.test(el.type)
        val = el.value
        // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here
        ;(!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val))
      }
      break
    case 'textarea':
      cb(n, normalize(el.value))
      break
    case 'select':
      if (el.type.toLowerCase() === 'select-one') {
        optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null)
      } else {
        for (i = 0; el.length && i < el.length; i++) {
          el.options[i].selected && optCb(el.options[i])
        }
      }
      break
    }
  }

  // collect up all form elements found from the passed argument elements all
  // the way down to child elements; pass a '<form>' or form fields.
  // called with 'this'=callback to use for serial() on each element
  function eachFormElement () {
    var cb = this
      , e, i
      , serializeSubtags = function (e, tags) {
          var i, j, fa
          for (i = 0; i < tags.length; i++) {
            fa = e[byTag](tags[i])
            for (j = 0; j < fa.length; j++) serial(fa[j], cb)
          }
        }

    for (i = 0; i < arguments.length; i++) {
      e = arguments[i]
      if (/input|select|textarea/i.test(e.tagName)) serial(e, cb)
      serializeSubtags(e, [ 'input', 'select', 'textarea' ])
    }
  }

  // standard query string style serialization
  function serializeQueryString () {
    return reqwest.toQueryString(reqwest.serializeArray.apply(null, arguments))
  }

  // { 'name': 'value', ... } style serialization
  function serializeHash () {
    var hash = {}
    eachFormElement.apply(function (name, value) {
      if (name in hash) {
        hash[name] && !isArray(hash[name]) && (hash[name] = [hash[name]])
        hash[name].push(value)
      } else hash[name] = value
    }, arguments)
    return hash
  }

  // [ { name: 'name', value: 'value' }, ... ] style serialization
  reqwest.serializeArray = function () {
    var arr = []
    eachFormElement.apply(function (name, value) {
      arr.push({name: name, value: value})
    }, arguments)
    return arr
  }

  reqwest.serialize = function () {
    if (arguments.length === 0) return ''
    var opt, fn
      , args = Array.prototype.slice.call(arguments, 0)

    opt = args.pop()
    opt && opt.nodeType && args.push(opt) && (opt = null)
    opt && (opt = opt.type)

    if (opt == 'map') fn = serializeHash
    else if (opt == 'array') fn = reqwest.serializeArray
    else fn = serializeQueryString

    return fn.apply(null, args)
  }

  reqwest.toQueryString = function (o) {
    var qs = '', i
      , enc = encodeURIComponent
      , push = function (k, v) {
          qs += enc(k) + '=' + enc(v) + '&'
        }
      , k, v

    if (isArray(o)) {
      for (i = 0; o && i < o.length; i++) push(o[i].name, o[i].value)
    } else {
      for (k in o) {
        if (!Object.hasOwnProperty.call(o, k)) continue
        v = o[k]
        if (isArray(v)) {
          for (i = 0; i < v.length; i++) push(k, v[i])
        } else push(k, o[k])
      }
    }

    // spaces should be + according to spec
    return qs.replace(/&$/, '').replace(/%20/g, '+')
  }

  reqwest.getcallbackPrefix = function () {
    return callbackPrefix
  }

  // jQuery and Zepto compatibility, differences can be remapped here so you can call
  // .ajax.compat(options, callback)
  reqwest.compat = function (o, fn) {
    if (o) {
      o.type && (o.method = o.type) && delete o.type
      o.dataType && (o.type = o.dataType)
      o.jsonpCallback && (o.jsonpCallbackName = o.jsonpCallback) && delete o.jsonpCallback
      o.jsonp && (o.jsonpCallback = o.jsonp)
    }
    return new Reqwest(o, fn)
  }

  return reqwest
});wax = wax || {};

// Attribution
// -----------
wax.attribution = function() {
    var a = {};

    var container = document.createElement('div');
    container.className = 'map-attribution';

    a.content = function(x) {
        if (typeof x === 'undefined') return container.innerHTML;
        container.innerHTML = wax.u.sanitize(x);
        return this;
    };

    a.element = function() {
        return container;
    };

    a.init = function() {
        return this;
    };

    return a;
};
wax = wax || {};

// Attribution
// -----------
wax.bwdetect = function(options, callback) {
    var detector = {},
        threshold = options.threshold || 400,
        // test image: 30.29KB
        testImage = 'http://a.tiles.mapbox.com/mapbox/1.0.0/blue-marble-topo-bathy-jul/0/0/0.png?preventcache=' + (+new Date()),
        // High-bandwidth assumed
        // 1: high bandwidth (.png, .jpg)
        // 0: low bandwidth (.png128, .jpg70)
        bw = 1,
        // Alternative versions
        auto = options.auto === undefined ? true : options.auto;

    function bwTest() {
        wax.bw = -1;
        var im = new Image();
        im.src = testImage;
        var first = true;
        var timeout = setTimeout(function() {
            if (first && wax.bw == -1) {
                detector.bw(0);
                first = false;
            }
        }, threshold);
        im.onload = function() {
            if (first && wax.bw == -1) {
                clearTimeout(timeout);
                detector.bw(1);
                first = false;
            }
        };
    }

    detector.bw = function(x) {
        if (!arguments.length) return bw;
        var oldBw = bw;
        if (wax.bwlisteners && wax.bwlisteners.length) (function () {
            listeners = wax.bwlisteners;
            wax.bwlisteners = [];
            for (i = 0; i < listeners; i++) {
                listeners[i](x);
            }
        })();
        wax.bw = x;

        if (bw != (bw = x)) callback(x);
    };

    detector.add = function() {
        if (auto) bwTest();
        return this;
    };

    if (wax.bw == -1) {
      wax.bwlisteners = wax.bwlisteners || [];
      wax.bwlisteners.push(detector.bw);
    } else if (wax.bw !== undefined) {
        detector.bw(wax.bw);
    } else {
        detector.add();
    }
    return detector;
};
// Formatter
// ---------
//
// This code is no longer the recommended code path for Wax -
// see `template.js`, a safe implementation of Mustache templates.
wax.formatter = function(x) {
    var formatter = {},
        f;

    // Prevent against just any input being used.
    if (x && typeof x === 'string') {
        try {
            // Ugly, dangerous use of eval.
            eval('f = ' + x);
        } catch (e) {
            if (console) console.log(e);
        }
    } else if (x && typeof x === 'function') {
        f = x;
    } else {
        f = function() {};
    }

    // Wrap the given formatter function in order to
    // catch exceptions that it may throw.
    formatter.format = function(options, data) {
        try {
            return wax.u.sanitize(f(options, data));
        } catch (e) {
            if (console) console.log(e);
        }
    };

    return formatter;
};
// GridInstance
// ------------
// GridInstances are queryable, fully-formed
// objects for acquiring features from events.
//
// This code ignores format of 1.1-1.2
wax.gi = function(grid_tile, options) {
    options = options || {};
    // resolution is the grid-elements-per-pixel ratio of gridded data.
    // The size of a tile element. For now we expect tiles to be squares.
    var instance = {},
        resolution = options.resolution || 4,
        tileSize = options.tileSize || 256;

    // Resolve the UTF-8 encoding stored in grids to simple
    // number values.
    // See the [utfgrid spec](https://github.com/mapbox/utfgrid-spec)
    // for details.
    function resolveCode(key) {
        if (key >= 93) key--;
        if (key >= 35) key--;
        key -= 32;
        return key;
    }

    instance.grid_tile = function() {
        return grid_tile;
    };

    instance.getKey = function(x, y) {
        if (!(grid_tile && grid_tile.grid)) return;
        if ((y < 0) || (x < 0)) return;
        if ((Math.floor(y) >= tileSize) ||
            (Math.floor(x) >= tileSize)) return;
        // Find the key in the grid. The above calls should ensure that
        // the grid's array is large enough to make this work.
        return resolveCode(grid_tile.grid[
           Math.floor((y) / resolution)
        ].charCodeAt(
           Math.floor((x) / resolution)
        ));
    };

    // Lower-level than tileFeature - has nothing to do
    // with the DOM. Takes a px offset from 0, 0 of a grid.
    instance.gridFeature = function(x, y) {
        // Find the key in the grid. The above calls should ensure that
        // the grid's array is large enough to make this work.
        var key = this.getKey(x, y),
            keys = grid_tile.keys;

        if (keys &&
            keys[key] &&
            grid_tile.data[keys[key]]) {
            return grid_tile.data[keys[key]];
        }
    };

    // Get a feature:
    // * `x` and `y`: the screen coordinates of an event
    // * `tile_element`: a DOM element of a tile, from which we can get an offset.
    instance.tileFeature = function(x, y, tile_element) {
        if (!grid_tile) return;
        // IE problem here - though recoverable, for whatever reason
        var offset = wax.u.offset(tile_element);
            feature = this.gridFeature(x - offset.left, y - offset.top);
        return feature;
    };

    return instance;
};
// GridManager
// -----------
// Generally one GridManager will be used per map.
//
// It takes one options object, which current accepts a single option:
// `resolution` determines the number of pixels per grid element in the grid.
// The default is 4.
wax.gm = function() {

    var resolution = 4,
        grid_tiles = {},
        manager = {},
        tilejson,
        formatter;

    var gridUrl = function(url) {
        if (url) {
            return url.replace(/(\.png|\.jpg|\.jpeg)(\d*)/, '.grid.json');
        }
    };

    function templatedGridUrl(template) {
        if (typeof template === 'string') template = [template];
        return function templatedGridFinder(url) {
            if (!url) return;
            var rx = new RegExp(manager.tileRegexp())
            var xyz = rx.exec(url);
            if (!xyz) return;
            return template[parseInt(xyz[2], 10) % template.length]
                .replace(/\{z\}/g, xyz[1])
                .replace(/\{x\}/g, xyz[2])
                .replace(/\{y\}/g, xyz[3]);
        };
    }

    // return the regexp to catch the tile number given the url
    manager.tileRegexp = function() {
      var tileTemplate = tilejson.tiles[0];
      // remove params
      var p = tileTemplate.indexOf('?');
      if(p !== -1) {
        tileTemplate = tileTemplate.substr(0, p);
      }
      // remove from the url all the special characters
      // replacing them by a dot (dont mind the character)
      tileTemplate = tileTemplate.
                        replace(/[\(\)\?\$\*\+\^]/g,'.')

      // the browser removes the port in the case it matchs with
      // the default port of the protocol
      if(tileTemplate.indexOf('https') === 0) {
        tileTemplate = tileTemplate.replace(':443', '[:0-9]*')
      } else if(tileTemplate.indexOf('http') === 0) {
        tileTemplate = tileTemplate.replace(':80', '[:0-9]*')
      }

      var r = '';
      if(tilejson.tiles.length > 1) {
        var t0 = tilejson.tiles[0];
        var t1 = tilejson.tiles[1];
        //search characters where differs
        for(var i = 0; i < t0.length; ++i) {
          if(t0.charAt(i) != t1.charAt(i)) {
            r += '.';
          } else {
            r += tileTemplate.charAt(i) || '';
          }
        }
      } else {
        r = tileTemplate;
      }

      // replace the first {x}{y}{z} by (\\d+)
      return r
        .replace(/\{x\}/,'(\\d+)')
        .replace(/\{y\}/,'(\\d+)')
        .replace(/\{z\}/,'(\\d+)')
    }

    manager.formatter = function(x) {
        if (!arguments.length) return formatter;
        formatter =  wax.formatter(x);
        return manager;
    };

    manager.template = function(x) {
        if (!arguments.length) return formatter;
        formatter = wax.template(x);
        return manager;
    };

    manager.gridUrl = function(x) {
        // Getter-setter
        if (!arguments.length) return gridUrl;

        // Handle tilesets that don't support grids
        if (!x) {
            gridUrl = function() { return null; };
        } else {
            gridUrl = typeof x === 'function' ?
                x : templatedGridUrl(x);
        }
        return manager;
    };

    manager.getGrid = function(url, callback) {
        var gurl = gridUrl(url);
        if (!formatter || !gurl) return callback(null, null);

        wax.request.get(gurl, function(err, t) {
            if (err) return callback(err, null);
            callback(null, wax.gi(t, {
                formatter: formatter,
                resolution: resolution
            }));
        });
        return manager;
    };

    manager.tilejson = function(x) {
        if (!arguments.length) return tilejson;
        // prefer templates over formatters
        if (x.template) {
            manager.template(x.template);
        } else if (x.formatter) {
            manager.formatter(x.formatter);
        } else {
            // In this case, we cannot support grids
            formatter = undefined;
        }
        manager.gridUrl(x.grids);
        if (x.resolution) resolution = x.resolution;
        tilejson = x;
        return manager;
    };

    return manager;
};
wax = wax || {};

// Hash
// ----
wax.hash = function(options) {
    options = options || {};

    var s0, // old hash
        hash = {},
        lat = 90 - 1e-8;  // allowable latitude range

    function getState() {
        return location.hash.substring(1);
    }

    function pushState(state) {
        var l = window.location;
        l.replace(l.toString().replace((l.hash || /$/), '#' + state));
    }

    function parseHash(s) {
        var args = s.split('/');
        for (var i = 0; i < args.length; i++) {
            args[i] = Number(args[i]);
            if (isNaN(args[i])) return true;
        }
        if (args.length < 3) {
            // replace bogus hash
            return true;
        } else if (args.length == 3) {
            options.setCenterZoom(args);
        }
    }

    function move() {
        var s1 = options.getCenterZoom();
        if (s0 !== s1) {
            s0 = s1;
            // don't recenter the map!
            pushState(s0);
        }
    }

    function stateChange(state) {
        // ignore spurious hashchange events
        if (state === s0) return;
        if (parseHash(s0 = state)) {
            // replace bogus hash
            move();
        }
    }

    var _move = wax.u.throttle(move, 500);

    hash.add = function() {
        stateChange(getState());
        options.bindChange(_move);
        return hash;
    };

    hash.remove = function() {
        options.unbindChange(_move);
        return hash;
    };

    return hash;
};
wax = wax || {};

wax.interaction = function() {
    var gm = wax.gm(),
        interaction = {},
        _downLock = false,
        _clickTimeout = null,
        // Active feature
        // Down event
        _d,
        // Touch tolerance
        tol = 4,
        grid,
        attach,
        detach,
        parent,
        map,
        tileGrid;

    var defaultEvents = {
        mousemove: onMove,
        touchstart: onDown,
        mousedown: onDown
    };

    var touchEnds = {
        touchend: onUp,
        touchmove: onUp,
        touchcancel: touchCancel
    };

    var pointerEnds = {
        MSPointerUp: onUp,
        MSPointerMove: onUp,
        MSPointerCancel: touchCancel
    };

    // Abstract getTile method. Depends on a tilegrid with
    // grid[ [x, y, tile] ] structure.
    function getTile(e) {
        var g = grid();
        var regExp = new RegExp(gm.tileRegexp());
        for (var i = 0; i < g.length; i++) {
            if (e) {
                var isInside = ((g[i][0] <= e.y) &&
                     ((g[i][0] + 256) > e.y) &&
                      (g[i][1] <= e.x) &&
                     ((g[i][1] + 256) > e.x));
                if(isInside && regExp.exec(g[i][2].src)) {
                    return g[i][2];
                }
            }
        }
        return false;
    }

    // Clear the double-click timeout to prevent double-clicks from
    // triggering popups.
    function killTimeout() {
        if (_clickTimeout) {
            window.clearTimeout(_clickTimeout);
            _clickTimeout = null;
            return true;
        } else {
            return false;
        }
    }

    function onMove(e) {
        // If the user is actually dragging the map, exit early
        // to avoid performance hits.
        if (_downLock) return;

        var pos = wax.u.eventoffset(e);

        interaction.screen_feature(pos, function(feature) {
            if (feature) {
                bean.fire(interaction, 'on', {
                    parent: parent(),
                    data: feature,
                    formatter: gm.formatter().format,
                    e: e
                });
            } else {
                bean.fire(interaction, 'off');
            }
        });
    }

    // A handler for 'down' events - which means `mousedown` and `touchstart`
    function onDown(e) {

        // Prevent interaction offset calculations happening while
        // the user is dragging the map.
        //
        // Store this event so that we can compare it to the
        // up event
        _downLock = true;
        _d = wax.u.eventoffset(e);
        if (e.type === 'mousedown') {
            bean.add(document.body, 'click', onUp);
            // track mouse up to remove lockDown when the drags end
            bean.add(document.body, 'mouseup', dragEnd);

        // Only track single-touches. Double-touches will not affect this
        // control
        } else if (e.type === 'touchstart' && e.touches.length === 1) {
            // Don't make the user click close if they hit another tooltip
            bean.fire(interaction, 'off');
            // Touch moves invalidate touches
            bean.add(parent(), touchEnds);
        } else if (e.originalEvent.type === "MSPointerDown" && e.originalEvent.touches.length === 1) {
          // Don't make the user click close if they hit another tooltip
            bean.fire(interaction, 'off');
            // Touch moves invalidate touches
            bean.add(parent(), pointerEnds);
        }

    }

    function dragEnd() {
        _downLock = false;
    }

    function touchCancel() {
        bean.remove(parent(), touchEnds);
        bean.remove(parent(), pointerEnds);
        _downLock = false;
    }

    function onUp(e) {
        var evt = {},
            pos = wax.u.eventoffset(e.originalEvent);
        _downLock = false;

        for (var key in e.originalEvent) {
          evt[key] = e.originalEvent[key];
        }

        evt.changedTouches = [];

        bean.remove(document.body, 'mouseup', onUp);
        bean.remove(parent(), touchEnds);
        bean.remove(parent(), pointerEnds);

        if (e.type === 'touchend') {
            // If this was a touch and it survived, there's no need to avoid a double-tap
            // but also wax.u.eventoffset will have failed, since this touch
            // event doesn't have coordinates
            interaction.click(e, _d);
        } else if (evt.type === "MSPointerMove" || evt.type === "MSPointerUp") {
            interaction.click(evt, pos);
        } else if (Math.round(pos.y / tol) === Math.round(_d.y / tol) &&
            Math.round(pos.x / tol) === Math.round(_d.x / tol)) {
            // Contain the event data in a closure.
            // Ignore double-clicks by ignoring clicks within 300ms of
            // each other.
            if(!_clickTimeout) {
              _clickTimeout = window.setTimeout(function() {
                  _clickTimeout = null;
                  interaction.click(evt, pos);
              }, 150);
            } else {
              killTimeout();
            }
        }
        return onUp;
    }

    // Handle a click event. Takes a second
    interaction.click = function(e, pos) {
        interaction.screen_feature(pos, function(feature) {
            if (feature) bean.fire(interaction, 'on', {
                parent: parent(),
                data: feature,
                formatter: gm.formatter().format,
                e: e
            });
        });
    };

    interaction.screen_feature = function(pos, callback) {
        var tile = getTile(pos);
        if (!tile) callback(null);
        gm.getGrid(tile.src, function(err, g) {
            if (err || !g) return callback(null);
            var feature = g.tileFeature(pos.x, pos.y, tile);
            callback(feature);
        });
    };

    // set an attach function that should be
    // called when maps are set
    interaction.attach = function(x) {
        if (!arguments.length) return attach;
        attach = x;
        return interaction;
    };

    interaction.detach = function(x) {
        if (!arguments.length) return detach;
        detach = x;
        return interaction;
    };

    // Attach listeners to the map
    interaction.map = function(x) {
        if (!arguments.length) return map;
        map = x;
        if (attach) attach(map);
        bean.add(parent(), defaultEvents);
        bean.add(parent(), 'touchstart', onDown);
        bean.add(parent(), 'MSPointerDown', onDown);
        return interaction;
    };

    // set a grid getter for this control
    interaction.grid = function(x) {
        if (!arguments.length) return grid;
        grid = x;
        return interaction;
    };

    // detach this and its events from the map cleanly
    interaction.remove = function(x) {
        if (detach) detach(map);
        bean.remove(parent(), defaultEvents);
        bean.fire(interaction, 'remove');
        return interaction;
    };

    // get or set a tilejson chunk of json
    interaction.tilejson = function(x) {
        if (!arguments.length) return gm.tilejson();
        gm.tilejson(x);
        return interaction;
    };

    // return the formatter, which has an exposed .format
    // function
    interaction.formatter = function() {
        return gm.formatter();
    };

    // ev can be 'on', 'off', fn is the handler
    interaction.on = function(ev, fn) {
        bean.add(interaction, ev, fn);
        return interaction;
    };

    // ev can be 'on', 'off', fn is the handler
    interaction.off = function(ev, fn) {
        bean.remove(interaction, ev, fn);
        return interaction;
    };

    // Return or set the gridmanager implementation
    interaction.gridmanager = function(x) {
        if (!arguments.length) return gm;
        gm = x;
        return interaction;
    };

    // parent should be a function that returns
    // the parent element of the map
    interaction.parent  = function(x) {
        parent = x;
        return interaction;
    };

    return interaction;
};
var wax = wax || {};

wax.location = function() {

    var t = {};

    function on(o) {
        if ((o.e.type === 'mousemove' || !o.e.type)) {
            return;
        } else {
            var loc = o.formatter({ format: 'location' }, o.data);
            if (loc) {
                window.location.href = loc;
            }
        }
    }

    t.events = function() {
        return {
            on: on
        };
    };

    return t;

};
// Wax GridUtil
// ------------

// Wax header
var wax = wax || {};

// Request
// -------
// Request data cache. `callback(data)` where `data` is the response data.
wax.request = {
    cache: {},
    locks: {},
    promises: {},
    get: function(url, callback) {
        // Cache hit.
        if (this.cache[url]) {
            return callback(this.cache[url][0], this.cache[url][1]);
        // Cache miss.
        } else {
            this.promises[url] = this.promises[url] || [];
            this.promises[url].push(callback);
            // Lock hit.
            if (this.locks[url]) return;
            // Request.
            var that = this;
            this.locks[url] = true;
            reqwest({
                url: url + (~url.indexOf('?') ? '&' : '?') + 'callback=grid',
                type: 'jsonp',
                jsonpCallback: 'callback',
                success: function(data) {
                    that.locks[url] = false;
                    that.cache[url] = [null, data];
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url][0], that.cache[url][1]);
                    }
                },
                error: function(err) {
                    that.locks[url] = false;
                    that.cache[url] = [err, null];
                    for (var i = 0; i < that.promises[url].length; i++) {
                        that.promises[url][i](that.cache[url][0], that.cache[url][1]);
                    }
                }
            });
        }
    }
};
// Templating
// ---------
wax.template = function(x) {
    var template = {};

    // Clone the data object such that the '__[format]__' key is only
    // set for this instance of templating.
    template.format = function(options, data) {
        var clone = {};
        for (var key in data) {
            clone[key] = data[key];
        }
        if (options.format) {
            clone['__' + options.format + '__'] = true;
        }
        return wax.u.sanitize(Mustache.to_html(x, clone));
    };

    return template;
};
if (!wax) var wax = {};

// A wrapper for reqwest jsonp to easily load TileJSON from a URL.
wax.tilejson = function(url, callback) {
    reqwest({
        url: url + (~url.indexOf('?') ? '&' : '?') + 'callback=grid',
        type: 'jsonp',
        jsonpCallback: 'callback',
        success: callback,
        error: callback
    });
};
var wax = wax || {};

// Utils are extracted from other libraries or
// written from scratch to plug holes in browser compatibility.
wax.u = {
    // From Bonzo
    offset: function(el) {
        // TODO: window margins
        //
        // Okay, so fall back to styles if offsetWidth and height are botched
        // by Firefox.
        var width = el.offsetWidth || parseInt(el.style.width, 10),
            height = el.offsetHeight || parseInt(el.style.height, 10),
            doc_body = document.body,
            top = 0,
            left = 0;

        var calculateOffset = function(el) {
            if (el === doc_body || el === document.documentElement) return;
            top += el.offsetTop;
            left += el.offsetLeft;

            var style = el.style.transform ||
                el.style.WebkitTransform ||
                el.style.OTransform ||
                el.style.MozTransform ||
                el.style.msTransform;

            if (style) {
                var match;
                if (match = style.match(/translate\((.+)px, (.+)px\)/)) {
                    top += parseInt(match[2], 10);
                    left += parseInt(match[1], 10);
                } else if (match = style.match(/translate3d\((.+)px, (.+)px, (.+)px\)/)) {
                    top += parseInt(match[2], 10);
                    left += parseInt(match[1], 10);
                } else if (match = style.match(/matrix3d\(([\-\d,\s]+)\)/)) {
                    var pts = match[1].split(',');
                    top += parseInt(pts[13], 10);
                    left += parseInt(pts[12], 10);
                } else if (match = style.match(/matrix\(.+, .+, .+, .+, (.+), (.+)\)/)) {
                    top += parseInt(match[2], 10);
                    left += parseInt(match[1], 10);
                }
            }
        };

        // from jquery, offset.js
        if ( typeof el.getBoundingClientRect !== "undefined" ) {
          var body = document.body;
          var doc = el.ownerDocument.documentElement;
          var clientTop  = document.clientTop  || body.clientTop  || 0;
          var clientLeft = document.clientLeft || body.clientLeft || 0;
          var scrollTop  = window.pageYOffset || doc.scrollTop;
          var scrollLeft = window.pageXOffset || doc.scrollLeft;

          var box = el.getBoundingClientRect();
          top = box.top + scrollTop  - clientTop;
          left = box.left + scrollLeft - clientLeft;

        } else {
          calculateOffset(el);
          try {
              while (el = el.offsetParent) { calculateOffset(el); }
          } catch(e) {
              // Hello, internet explorer.
          }
        }

        // Offsets from the body
        top += doc_body.offsetTop;
        left += doc_body.offsetLeft;
        // Offsets from the HTML element
        top += doc_body.parentNode.offsetTop;
        left += doc_body.parentNode.offsetLeft;

        // Firefox and other weirdos. Similar technique to jQuery's
        // `doesNotIncludeMarginInBodyOffset`.
        var htmlComputed = document.defaultView ?
            window.getComputedStyle(doc_body.parentNode, null) :
            doc_body.parentNode.currentStyle;
        if (doc_body.parentNode.offsetTop !==
            parseInt(htmlComputed.marginTop, 10) &&
            !isNaN(parseInt(htmlComputed.marginTop, 10))) {
            top += parseInt(htmlComputed.marginTop, 10);
            left += parseInt(htmlComputed.marginLeft, 10);
        }

        return {
            top: top,
            left: left,
            height: height,
            width: width
        };
    },

    '$': function(x) {
        return (typeof x === 'string') ?
            document.getElementById(x) :
            x;
    },

    // From quirksmode: normalize the offset of an event from the top-left
    // of the page.
    eventoffset: function(e) {
        var posx = 0;
        var posy = 0;
        if (!e) { e = window.event; }
        if (e.pageX || e.pageY) {
            // Good browsers
            return {
                x: e.pageX,
                y: e.pageY
            };
        } else if (e.clientX || e.clientY) {
            // Internet Explorer
            return {
                x: e.clientX,
                y: e.clientY
            };
        } else if (e.touches && e.touches.length === 1) {
            // Touch browsers
            return {
                x: e.touches[0].pageX,
                y: e.touches[0].pageY
            };
        }
    },

    // Ripped from underscore.js
    // Internal function used to implement `_.throttle` and `_.debounce`.
    limit: function(func, wait, debounce) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var throttler = function() {
                timeout = null;
                func.apply(context, args);
            };
            if (debounce) clearTimeout(timeout);
            if (debounce || !timeout) timeout = setTimeout(throttler, wait);
        };
    },

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time.
    throttle: function(func, wait) {
        return this.limit(func, wait, false);
    },

    sanitize: function(content) {
        if (!content) return '';

        function urlX(url) {
            // Data URIs are subject to a bug in Firefox
            // https://bugzilla.mozilla.org/show_bug.cgi?id=255107
            // which let them be a vector. But WebKit does 'the right thing'
            // or at least 'something' about this situation, so we'll tolerate
            // them.
            if (/^(https?:\/\/|data:image)/.test(url)) {
                return url;
            }
        }

        function idX(id) { return id; }

        return html_sanitize(content, urlX, idX);
    }
};
wax = wax || {};
wax.leaf = wax.leaf || {};

wax.leaf.hash = function(map) {
    return wax.hash({
        getCenterZoom: function () {
            var center = map.getCenter(),
                zoom = map.getZoom(),
                precision = Math.max(
                    0,
                    Math.ceil(Math.log(zoom) / Math.LN2));

            return [
                zoom,
                center.lat.toFixed(precision),
                center.lng.toFixed(precision)
            ].join('/');
        },

        setCenterZoom: function (args) {
            map.setView(new L.LatLng(args[1], args[2]), args[0]);
        },

        bindChange: function (fn) {
            map.on('moveend', fn);
        },

        unbindChange: function (fn) {
            map.off('moveend', fn);
        }
    });
};
wax = wax || {};
wax.leaf = wax.leaf || {};

wax.leaf.interaction = function() {
    var dirty = false, _grid, map;

    function setdirty() { dirty = true; }

    function grid() {
        // TODO: don't build for tiles outside of viewport
        // Touch interaction leads to intermediate
        //var zoomLayer = map.createOrGetLayer(Math.round(map.getZoom())); //?what is this doing?
        // Calculate a tile grid and cache it, by using the `.tiles`
        // element on this map.
        if (!dirty && _grid) {
            return _grid;
        } else {
            return (_grid = (function(layers) {
                var o = [];
                for (var layerId in layers) {
                    // This only supports tiled layers
                    if (layers[layerId]._tiles) {
                        for (var tile in layers[layerId]._tiles) {
                            var _tile = layers[layerId]._tiles[tile];
                            // avoid adding tiles without src, grid url can't be found for them
                            if(_tile.src) {
                              var offset = wax.u.offset(_tile);
                              o.push([offset.top, offset.left, _tile]);
                            }
                        }
                    }
                }
                return o;
            })(map._layers));
        }
    }

    function attach(x) {
        if (!arguments.length) return map;
        map = x;
        var l = ['moveend'];
        for (var i = 0; i < l.length; i++) {
            map.on(l[i], setdirty);
        }
    }

    function detach(x) {
        if (!arguments.length) return map;
        map = x;
        var l = ['moveend'];
        for (var i = 0; i < l.length; i++) {
            map.off(l[i], setdirty);
        }
    }

    return wax.interaction()
        .attach(attach)
        .detach(detach)
        .parent(function() {
          return map._container;
        })
        .grid(grid);
};
wax = wax || {};
wax.leaf = wax.leaf || {};

wax.leaf.connector = L.TileLayer.extend({
    initialize: function(options) {
        options = options || {};
        options.minZoom = options.minzoom || 0;
        options.maxZoom = options.maxzoom || 22;
        L.TileLayer.prototype.initialize.call(this, options.tiles[0], options);
    }
});
wax = wax || {};
wax.g = wax.g || {};

// Attribution
// -----------
// Attribution wrapper for Google Maps.
wax.g.attribution = function(map, tilejson) {
    tilejson = tilejson || {};
    var a, // internal attribution control
        attribution = {};

    attribution.element = function() {
        return a.element();
    };

    attribution.appendTo = function(elem) {
        wax.u.$(elem).appendChild(a.element());
        return this;
    };

    attribution.init = function() {
        a = wax.attribution();
        a.content(tilejson.attribution);
        a.element().className = 'map-attribution map-g';
        return this;
    };

    return attribution.init();
};
wax = wax || {};
wax.g = wax.g || {};

// Bandwidth Detection
// ------------------
wax.g.bwdetect = function(map, options) {
    options = options || {};
    var lowpng = options.png || '.png128',
        lowjpg = options.jpg || '.jpg70';

    // Create a low-bandwidth map type.
    if (!map.mapTypes['mb-low']) {
        var mb = map.mapTypes.mb;
        var tilejson = {
            tiles: [],
            scheme: mb.options.scheme,
            blankImage: mb.options.blankImage,
            minzoom: mb.minZoom,
            maxzoom: mb.maxZoom,
            name: mb.name,
            description: mb.description
        };
        for (var i = 0; i < mb.options.tiles.length; i++) {
            tilejson.tiles.push(mb.options.tiles[i]
                .replace('.png', lowpng)
                .replace('.jpg', lowjpg));
        }
        m.mapTypes.set('mb-low', new wax.g.connector(tilejson));
    }

    return wax.bwdetect(options, function(bw) {
      map.setMapTypeId(bw ? 'mb' : 'mb-low');
    });
};
wax = wax || {};
wax.g = wax.g || {};

wax.g.hash = function(map) {
    return wax.hash({
        getCenterZoom: function() {
            var center = map.getCenter(),
                zoom = map.getZoom(),
                precision = Math.max(
                    0,
                    Math.ceil(Math.log(zoom) / Math.LN2));
            return [zoom.toFixed(2),
                center.lat().toFixed(precision),
                center.lng().toFixed(precision)
            ].join('/');
        },
        setCenterZoom: function setCenterZoom(args) {
            map.setCenter(new google.maps.LatLng(args[1], args[2]));
            map.setZoom(args[0]);
        },
        bindChange: function(fn) {
            google.maps.event.addListener(map, 'idle', fn);
        },
        unbindChange: function(fn) {
            google.maps.event.removeListener(map, 'idle', fn);
        }
    });
};
wax = wax || {};
wax.g = wax.g || {};

wax.g.interaction = function() {
    var dirty = false, _grid, map;
    var tileloadListener = null,
        idleListener = null;

    function setdirty() { dirty = true; }

    function grid() {

        if (!dirty && _grid) {
            return _grid;
        } else {
            _grid = [];
            var zoom = map.getZoom();
            var mapOffset = wax.u.offset(map.getDiv());
            var get = function(mapType) {
                if (!mapType.interactive) return;
                for (var key in mapType.cache) {
                    if (key.split('/')[0] != zoom) continue;
                    var tileOffset = wax.u.offset(mapType.cache[key]);
                    _grid.push([
                        tileOffset.top,
                        tileOffset.left,
                        mapType.cache[key]
                    ]);
                }
            };
            // Iterate over base mapTypes and overlayMapTypes.
            for (var i in map.mapTypes) get(map.mapTypes[i]);
            map.overlayMapTypes.forEach(get);
        }
        return _grid;
    }

    function attach(x) {
        if (!arguments.length) return map;
        map = x;
        tileloadListener = google.maps.event.addListener(map, 'tileloaded',
            setdirty);
        idleListener = google.maps.event.addListener(map, 'idle',
            setdirty);
    }

    function detach(x) {
        if(tileloadListener)
          google.maps.event.removeListener(tileloadListener);
        if(idleListener)
          google.maps.event.removeListener(idleListener);
    }



    return wax.interaction()
        .attach(attach)
        .detach(detach)
        .parent(function() {
          return map.getDiv();
        })
        .grid(grid);
};
// Wax for Google Maps API v3
// --------------------------

// Wax header
var wax = wax || {};
wax.g = wax.g || {};

// Wax Google Maps MapType: takes an object of options in the form
//
//     {
//       name: '',
//       filetype: '.png',
//       layerName: 'world-light',
//       alt: '',
//       zoomRange: [0, 18],
//       baseUrl: 'a url',
//     }
wax.g.connector = function(options) {
    options = options || {};

    this.options = {
        tiles: options.tiles,
        scheme: options.scheme || 'xyz',
        blankImage: options.blankImage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    };

    this.opacity = options.opacity || 0;
    this.minZoom = options.minzoom || 0;
    this.maxZoom = options.maxzoom || 22;

    this.name = options.name || '';
    this.description = options.description || '';

    // non-configurable options
    this.interactive = true;
    this.tileSize = new google.maps.Size(256, 256);

    // DOM element cache
    this.cache = {};
};

// Get a tile element from a coordinate, zoom level, and an ownerDocument.
wax.g.connector.prototype.getTile = function(coord, zoom, ownerDocument) {
    var key = zoom + '/' + coord.x + '/' + coord.y;
    if (!this.cache[key]) {
        var img = this.cache[key] = new Image(256, 256);
        this.cache[key].src = this.getTileUrl(coord, zoom);
        this.cache[key].setAttribute('gTileKey', key);
        this.cache[key].setAttribute("style","opacity: "+this.opacity+"; filter: alpha(opacity="+(this.opacity*100)+");");
        this.cache[key].onerror = function() { img.style.display = 'none'; };
    }
    return this.cache[key];
};

// Remove a tile that has fallen out of the map's viewport.
//
// TODO: expire cache data in the gridmanager.
wax.g.connector.prototype.releaseTile = function(tile) {
    var key = tile.getAttribute('gTileKey');
    if (this.cache[key]) delete this.cache[key];
    if (tile.parentNode) tile.parentNode.removeChild(tile);
};

// Get a tile url, based on x, y coordinates and a z value.
wax.g.connector.prototype.getTileUrl = function(coord, z) {
    // Y coordinate is flipped in Mapbox, compared to Google
    var mod = Math.pow(2, z),
        y = (this.options.scheme === 'tms') ?
            (mod - 1) - coord.y :
            coord.y,
        x = (coord.x % mod);

    x = (x < 0) ? (coord.x % mod) + mod : x;

    if (y < 0) return this.options.blankImage;

    return this.options.tiles
        [parseInt(x + y, 10) %
            this.options.tiles.length]
                .replace(/\{z\}/g, z)
                .replace(/\{x\}/g, x)
                .replace(/\{y\}/g, y);
};
var GeoJSON = function( geojson, options ){

  var _geometryToGoogleMaps = function( geojsonGeometry, opts, geojsonProperties ){

    var googleObj;

    switch ( geojsonGeometry.type ){
      case "Point":
        opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[1], geojsonGeometry.coordinates[0]);
        googleObj = new google.maps.Marker(opts);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;

      case "MultiPoint":
        googleObj = [];
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          opts.position = new google.maps.LatLng(geojsonGeometry.coordinates[i][1], geojsonGeometry.coordinates[i][0]);
          googleObj.push(new google.maps.Marker(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        break;

      case "LineString":
        var path = [];
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var coord = geojsonGeometry.coordinates[i];
          var ll = new google.maps.LatLng(coord[1], coord[0]);
          path.push(ll);
        }
        opts.path = path;
        googleObj = new google.maps.Polyline(opts);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;

      case "MultiLineString":
        googleObj = [];
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var path = [];
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var coord = geojsonGeometry.coordinates[i][j];
            var ll = new google.maps.LatLng(coord[1], coord[0]);
            path.push(ll);
          }
          opts.path = path;
          googleObj.push(new google.maps.Polyline(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        break;

      case "Polygon":
        var paths = [];
        var exteriorDirection;
        var interiorDirection;
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var path = [];
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][1], geojsonGeometry.coordinates[i][j][0]);
            path.push(ll);
          }
          if(!i){
            exteriorDirection = _ccw(path);
            paths.push(path);
          }else if(i == 1){
            interiorDirection = _ccw(path);
            if(exteriorDirection == interiorDirection){
              paths.push(path.reverse());
            }else{
              paths.push(path);
            }
          }else{
            if(exteriorDirection == interiorDirection){
              paths.push(path.reverse());
            }else{
              paths.push(path);
            }
          }
        }
        opts.paths = paths;
        googleObj = new google.maps.Polygon(opts);
        if (geojsonProperties) {
          googleObj.set("geojsonProperties", geojsonProperties);
        }
        break;

      case "MultiPolygon":
        googleObj = [];
        for (var i = 0; i < geojsonGeometry.coordinates.length; i++){
          var paths = [];
          var exteriorDirection;
          var interiorDirection;
          for (var j = 0; j < geojsonGeometry.coordinates[i].length; j++){
            var path = [];
            for (var k = 0; k < geojsonGeometry.coordinates[i][j].length - 1; k++){
              var ll = new google.maps.LatLng(geojsonGeometry.coordinates[i][j][k][1], geojsonGeometry.coordinates[i][j][k][0]);
              path.push(ll);
            }
            if(!j){
              exteriorDirection = _ccw(path);
              paths.push(path);
            }else if(j == 1){
              interiorDirection = _ccw(path);
              if(exteriorDirection == interiorDirection){
                paths.push(path.reverse());
              }else{
                paths.push(path);
              }
            }else{
              if(exteriorDirection == interiorDirection){
                paths.push(path.reverse());
              }else{
                paths.push(path);
              }
            }
          }
          opts.paths = paths;
          googleObj.push(new google.maps.Polygon(opts));
        }
        if (geojsonProperties) {
          for (var k = 0; k < googleObj.length; k++){
            googleObj[k].set("geojsonProperties", geojsonProperties);
          }
        }
        break;

      case "GeometryCollection":
        googleObj = [];
        if (!geojsonGeometry.geometries){
          googleObj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
        }else{
          for (var i = 0; i < geojsonGeometry.geometries.length; i++){
            googleObj.push(_geometryToGoogleMaps(geojsonGeometry.geometries[i], opts, geojsonProperties || null));
          }
        }
        break;

      default:
        googleObj = _error("Invalid GeoJSON object: Geometry object must be one of \"Point\", \"LineString\", \"Polygon\" or \"MultiPolygon\".");
    }

    return googleObj;

  };

  var _error = function( message ){

    return {
type: "Error",
        message: message
    };

  };

  var _ccw = function( path ){
    var isCCW;
    var a = 0;
    for (var i = 0; i < path.length-2; i++){
      a += ((path[i+1].lat() - path[i].lat()) * (path[i+2].lng() - path[i].lng()) - (path[i+2].lat() - path[i].lat()) * (path[i+1].lng() - path[i].lng()));
    }
    if(a > 0){
      isCCW = true;
    }
    else{
      isCCW = false;
    }
    return isCCW;
  };

  var obj;

  var opts = options || {};

  switch ( geojson.type ){

    case "FeatureCollection":
      if (!geojson.features){
        obj = _error("Invalid GeoJSON object: FeatureCollection object missing \"features\" member.");
      }else{
        obj = [];
        for (var i = 0; i < geojson.features.length; i++){
          obj.push(_geometryToGoogleMaps(geojson.features[i].geometry, opts, geojson.features[i].properties));
        }
      }
      break;

    case "GeometryCollection":
      if (!geojson.geometries){
        obj = _error("Invalid GeoJSON object: GeometryCollection object missing \"geometries\" member.");
      }else{
        obj = [];
        for (var i = 0; i < geojson.geometries.length; i++){
          obj.push(_geometryToGoogleMaps(geojson.geometries[i], opts));
        }
      }
      break;

    case "Feature":
      if (!( geojson.properties && geojson.geometry )){
        obj = _error("Invalid GeoJSON object: Feature object missing \"properties\" or \"geometry\" member.");
      }else{
        obj = _geometryToGoogleMaps(geojson.geometry, opts, geojson.properties);
      }
      break;

    case "Point": case "MultiPoint": case "LineString": case "MultiLineString": case "Polygon": case "MultiPolygon":
      obj = geojson.coordinates
        ? obj = _geometryToGoogleMaps(geojson, opts)
        : _error("Invalid GeoJSON object: Geometry object missing \"coordinates\" member.");
      break;

    default:
      obj = _error("Invalid GeoJSON object: GeoJSON object must be one of \"Point\", \"LineString\", \"Polygon\", \"MultiPolygon\", \"Feature\", \"FeatureCollection\" or \"GeometryCollection\".");

  }

  return obj;

};
/*!
 * jScrollPane - v2.0.0beta12 - 2012-09-27
 * http://jscrollpane.kelvinluck.com/
 *
 * Copyright (c) 2010 Kelvin Luck
 * Dual licensed under the MIT or GPL licenses.
 */

// Script: jScrollPane - cross browser customisable scrollbars
//
// *Version: 2.0.0beta12, Last updated: 2012-09-27*
//
// Project Home - http://jscrollpane.kelvinluck.com/
// GitHub       - http://github.com/vitch/jScrollPane
// Source       - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.js
// (Minified)   - http://github.com/vitch/jScrollPane/raw/master/script/jquery.jscrollpane.min.js
//
// About: License
//
// Copyright (c) 2012 Kelvin Luck
// Dual licensed under the MIT or GPL Version 2 licenses.
// http://jscrollpane.kelvinluck.com/MIT-LICENSE.txt
// http://jscrollpane.kelvinluck.com/GPL-LICENSE.txt
//
// About: Examples
//
// All examples and demos are available through the jScrollPane example site at:
// http://jscrollpane.kelvinluck.com/
//
// About: Support and Testing
//
// This plugin is tested on the browsers below and has been found to work reliably on them. If you run
// into a problem on one of the supported browsers then please visit the support section on the jScrollPane
// website (http://jscrollpane.kelvinluck.com/) for more information on getting support. You are also
// welcome to fork the project on GitHub if you can contribute a fix for a given issue. 
//
// jQuery Versions - tested in 1.4.2+ - reported to work in 1.3.x
// Browsers Tested - Firefox 3.6.8, Safari 5, Opera 10.6, Chrome 5.0, IE 6, 7, 8
//
// About: Release History
//
// 2.0.0beta12 - (2012-09-27) fix for jQuery 1.8+
// 2.0.0beta11 - (2012-05-14)
// 2.0.0beta10 - (2011-04-17) cleaner required size calculation, improved keyboard support, stickToBottom/Left, other small fixes
// 2.0.0beta9 - (2011-01-31) new API methods, bug fixes and correct keyboard support for FF/OSX
// 2.0.0beta8 - (2011-01-29) touchscreen support, improved keyboard support
// 2.0.0beta7 - (2011-01-23) scroll speed consistent (thanks Aivo Paas)
// 2.0.0beta6 - (2010-12-07) scrollToElement horizontal support
// 2.0.0beta5 - (2010-10-18) jQuery 1.4.3 support, various bug fixes
// 2.0.0beta4 - (2010-09-17) clickOnTrack support, bug fixes
// 2.0.0beta3 - (2010-08-27) Horizontal mousewheel, mwheelIntent, keyboard support, bug fixes
// 2.0.0beta2 - (2010-08-21) Bug fixes
// 2.0.0beta1 - (2010-08-17) Rewrite to follow modern best practices and enable horizontal scrolling, initially hidden
//               elements and dynamically sized elements.
// 1.x - (2006-12-31 - 2010-07-31) Initial version, hosted at googlecode, deprecated

(function($,window,undefined){

  $.fn.jScrollPane = function(settings)
  {
    // JScrollPane "class" - public methods are available through $('selector').data('jsp')
    function JScrollPane(elem, s)
    {
      var settings, jsp = this, pane, paneWidth, paneHeight, container, contentWidth, contentHeight,
        percentInViewH, percentInViewV, isScrollableV, isScrollableH, verticalDrag, dragMaxY,
        verticalDragPosition, horizontalDrag, dragMaxX, horizontalDragPosition,
        verticalBar, verticalTrack, scrollbarWidth, verticalTrackHeight, verticalDragHeight, arrowUp, arrowDown,
        horizontalBar, horizontalTrack, horizontalTrackWidth, horizontalDragWidth, arrowLeft, arrowRight,
        reinitialiseInterval, originalPadding, originalPaddingTotalWidth, previousContentWidth,
        wasAtTop = true, wasAtLeft = true, wasAtBottom = false, wasAtRight = false,
        originalElement = elem.clone(false, false).empty(),
        mwEvent = $.fn.mwheelIntent ? 'mwheelIntent.jsp' : 'mousewheel.jsp';

      originalPadding = elem.css('paddingTop') + ' ' +
                elem.css('paddingRight') + ' ' +
                elem.css('paddingBottom') + ' ' +
                elem.css('paddingLeft');
      originalPaddingTotalWidth = (parseInt(elem.css('paddingLeft'), 10) || 0) +
                    (parseInt(elem.css('paddingRight'), 10) || 0);

      function initialise(s)
      {

        var /*firstChild, lastChild, */isMaintainingPositon, lastContentX, lastContentY,
            hasContainingSpaceChanged, originalScrollTop, originalScrollLeft,
            maintainAtBottom = false, maintainAtRight = false;

        settings = s;

        if (pane === undefined) {
          originalScrollTop = elem.scrollTop();
          originalScrollLeft = elem.scrollLeft();

          elem.css(
            {
              overflow: 'hidden',
              padding: 0
            }
          );
          // TODO: Deal with where width/ height is 0 as it probably means the element is hidden and we should
          // come back to it later and check once it is unhidden...
          paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
          paneHeight = elem.innerHeight();

          elem.width(paneWidth);
          
          pane = $('<div class="jspPane" />').css('padding', originalPadding).append(elem.children());
          container = $('<div class="jspContainer" />')
            .css({
              'width': paneWidth + 'px',
              'height': paneHeight + 'px'
            }
          ).append(pane).appendTo(elem);

          /*
          // Move any margins from the first and last children up to the container so they can still
          // collapse with neighbouring elements as they would before jScrollPane 
          firstChild = pane.find(':first-child');
          lastChild = pane.find(':last-child');
          elem.css(
            {
              'margin-top': firstChild.css('margin-top'),
              'margin-bottom': lastChild.css('margin-bottom')
            }
          );
          firstChild.css('margin-top', 0);
          lastChild.css('margin-bottom', 0);
          */
        } else {
          elem.css('width', '');

          maintainAtBottom = settings.stickToBottom && isCloseToBottom();
          maintainAtRight  = settings.stickToRight  && isCloseToRight();

          hasContainingSpaceChanged = elem.innerWidth() + originalPaddingTotalWidth != paneWidth || elem.outerHeight() != paneHeight;

          if (hasContainingSpaceChanged) {
            paneWidth = elem.innerWidth() + originalPaddingTotalWidth;
            paneHeight = elem.innerHeight();
            container.css({
              width: paneWidth + 'px',
              height: paneHeight + 'px'
            });
          }

          // If nothing changed since last check...
          if (!hasContainingSpaceChanged && previousContentWidth == contentWidth && pane.outerHeight() == contentHeight) {
            elem.width(paneWidth);
            return;
          }
          previousContentWidth = contentWidth;
          
          pane.css('width', '');
          elem.width(paneWidth);

          container.find('>.jspVerticalBar,>.jspHorizontalBar').remove().end();
        }

        pane.css('overflow', 'auto');
        if (s.contentWidth) {
          contentWidth = s.contentWidth;
        } else {
          contentWidth = pane[0].scrollWidth;
        }
        contentHeight = pane[0].scrollHeight;
        pane.css('overflow', '');

        percentInViewH = contentWidth / paneWidth;
        percentInViewV = contentHeight / paneHeight;
        isScrollableV = percentInViewV > 1;

        isScrollableH = percentInViewH > 1;

        //console.log(paneWidth, paneHeight, contentWidth, contentHeight, percentInViewH, percentInViewV, isScrollableH, isScrollableV);

        if (!(isScrollableH || isScrollableV)) {
          elem.removeClass('jspScrollable');
          pane.css({
            top: 0,
            width: container.width() - originalPaddingTotalWidth
          });
          removeMousewheel();
          removeFocusHandler();
          removeKeyboardNav();
          removeClickOnTrack();
        } else {
          elem.addClass('jspScrollable');

          isMaintainingPositon = settings.maintainPosition && (verticalDragPosition || horizontalDragPosition);
          if (isMaintainingPositon) {
            lastContentX = contentPositionX();
            lastContentY = contentPositionY();
          }

          initialiseVerticalScroll();
          initialiseHorizontalScroll();
          resizeScrollbars();

          if (isMaintainingPositon) {
            scrollToX(maintainAtRight  ? (contentWidth  - paneWidth ) : lastContentX, false);
            scrollToY(maintainAtBottom ? (contentHeight - paneHeight) : lastContentY, false);
          }

          initFocusHandler();
          initMousewheel();
          initTouch();
          
          if (settings.enableKeyboardNavigation) {
            initKeyboardNav();
          }
          if (settings.clickOnTrack) {
            initClickOnTrack();
          }
          
          observeHash();
          if (settings.hijackInternalLinks) {
            hijackInternalLinks();
          }
        }

        if (settings.autoReinitialise && !reinitialiseInterval) {
          reinitialiseInterval = setInterval(
            function()
            {
              initialise(settings);
            },
            settings.autoReinitialiseDelay
          );
        } else if (!settings.autoReinitialise && reinitialiseInterval) {
          clearInterval(reinitialiseInterval);
        }

        originalScrollTop && elem.scrollTop(0) && scrollToY(originalScrollTop, false);
        originalScrollLeft && elem.scrollLeft(0) && scrollToX(originalScrollLeft, false);

        elem.trigger('jsp-initialised', [isScrollableH || isScrollableV]);
      }

      function initialiseVerticalScroll()
      {
        if (isScrollableV) {

          container.append(
            $('<div class="jspVerticalBar" />').append(
              $('<div class="jspCap jspCapTop" />'),
              $('<div class="jspTrack" />').append(
                $('<div class="jspDrag" />').append(
                  $('<div class="jspDragTop" />'),
                  $('<div class="jspDragBottom" />')
                )
              ),
              $('<div class="jspCap jspCapBottom" />')
            )
          );

          verticalBar = container.find('>.jspVerticalBar');
          verticalTrack = verticalBar.find('>.jspTrack');
          verticalDrag = verticalTrack.find('>.jspDrag');

          if (settings.showArrows) {
            arrowUp = $('<a class="jspArrow jspArrowUp" />').bind(
              'mousedown.jsp', getArrowScroll(0, -1)
            ).bind('click.jsp', nil);
            arrowDown = $('<a class="jspArrow jspArrowDown" />').bind(
              'mousedown.jsp', getArrowScroll(0, 1)
            ).bind('click.jsp', nil);
            if (settings.arrowScrollOnHover) {
              arrowUp.bind('mouseover.jsp', getArrowScroll(0, -1, arrowUp));
              arrowDown.bind('mouseover.jsp', getArrowScroll(0, 1, arrowDown));
            }

            appendArrows(verticalTrack, settings.verticalArrowPositions, arrowUp, arrowDown);
          }

          verticalTrackHeight = paneHeight;
          container.find('>.jspVerticalBar>.jspCap:visible,>.jspVerticalBar>.jspArrow').each(
            function()
            {
              verticalTrackHeight -= $(this).outerHeight();
            }
          );


          verticalDrag.hover(
            function()
            {
              verticalDrag.addClass('jspHover');
            },
            function()
            {
              verticalDrag.removeClass('jspHover');
            }
          ).bind(
            'mousedown.jsp',
            function(e)
            {
              // Stop IE from allowing text selection
              $('html').bind('dragstart.jsp selectstart.jsp', nil);

              verticalDrag.addClass('jspActive');

              var startY = e.pageY - verticalDrag.position().top;

              $('html').bind(
                'mousemove.jsp',
                function(e)
                {
                  positionDragY(e.pageY - startY, false);
                }
              ).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
              return false;
            }
          );
          sizeVerticalScrollbar();
        }
      }

      function sizeVerticalScrollbar()
      {
        verticalTrack.height(verticalTrackHeight + 'px');
        verticalDragPosition = 0;
        scrollbarWidth = settings.verticalGutter + verticalTrack.outerWidth();

        // Make the pane thinner to allow for the vertical scrollbar
        pane.width(paneWidth - scrollbarWidth - originalPaddingTotalWidth);

        // Add margin to the left of the pane if scrollbars are on that side (to position
        // the scrollbar on the left or right set it's left or right property in CSS)
        try {
          if (verticalBar.position().left === 0) {
            pane.css('margin-left', scrollbarWidth + 'px');
          }
        } catch (err) {
        }
      }

      function initialiseHorizontalScroll()
      {
        if (isScrollableH) {

          container.append(
            $('<div class="jspHorizontalBar" />').append(
              $('<div class="jspCap jspCapLeft" />'),
              $('<div class="jspTrack" />').append(
                $('<div class="jspDrag" />').append(
                  $('<div class="jspDragLeft" />'),
                  $('<div class="jspDragRight" />')
                )
              ),
              $('<div class="jspCap jspCapRight" />')
            )
          );

          horizontalBar = container.find('>.jspHorizontalBar');
          horizontalTrack = horizontalBar.find('>.jspTrack');
          horizontalDrag = horizontalTrack.find('>.jspDrag');

          if (settings.showArrows) {
            arrowLeft = $('<a class="jspArrow jspArrowLeft" />').bind(
              'mousedown.jsp', getArrowScroll(-1, 0)
            ).bind('click.jsp', nil);
            arrowRight = $('<a class="jspArrow jspArrowRight" />').bind(
              'mousedown.jsp', getArrowScroll(1, 0)
            ).bind('click.jsp', nil);
            if (settings.arrowScrollOnHover) {
              arrowLeft.bind('mouseover.jsp', getArrowScroll(-1, 0, arrowLeft));
              arrowRight.bind('mouseover.jsp', getArrowScroll(1, 0, arrowRight));
            }
            appendArrows(horizontalTrack, settings.horizontalArrowPositions, arrowLeft, arrowRight);
          }

          horizontalDrag.hover(
            function()
            {
              horizontalDrag.addClass('jspHover');
            },
            function()
            {
              horizontalDrag.removeClass('jspHover');
            }
          ).bind(
            'mousedown.jsp',
            function(e)
            {
              // Stop IE from allowing text selection
              $('html').bind('dragstart.jsp selectstart.jsp', nil);

              horizontalDrag.addClass('jspActive');

              var startX = e.pageX - horizontalDrag.position().left;

              $('html').bind(
                'mousemove.jsp',
                function(e)
                {
                  positionDragX(e.pageX - startX, false);
                }
              ).bind('mouseup.jsp mouseleave.jsp', cancelDrag);
              return false;
            }
          );
          horizontalTrackWidth = container.innerWidth();
          sizeHorizontalScrollbar();
        }
      }

      function sizeHorizontalScrollbar()
      {
        container.find('>.jspHorizontalBar>.jspCap:visible,>.jspHorizontalBar>.jspArrow').each(
          function()
          {
            horizontalTrackWidth -= $(this).outerWidth();
          }
        );

        horizontalTrack.width(horizontalTrackWidth + 'px');
        horizontalDragPosition = 0;
      }

      function resizeScrollbars()
      {
        if (isScrollableH && isScrollableV) {
          var horizontalTrackHeight = horizontalTrack.outerHeight(),
            verticalTrackWidth = verticalTrack.outerWidth();
          verticalTrackHeight -= horizontalTrackHeight;
          $(horizontalBar).find('>.jspCap:visible,>.jspArrow').each(
            function()
            {
              horizontalTrackWidth += $(this).outerWidth();
            }
          );
          horizontalTrackWidth -= verticalTrackWidth;
          paneHeight -= verticalTrackWidth;
          paneWidth -= horizontalTrackHeight;
          horizontalTrack.parent().append(
            $('<div class="jspCorner" />').css('width', horizontalTrackHeight + 'px')
          );
          sizeVerticalScrollbar();
          sizeHorizontalScrollbar();
        }
        // reflow content
        if (isScrollableH) {
          pane.width((container.outerWidth() - originalPaddingTotalWidth) + 'px');
        }
        contentHeight = pane.outerHeight();
        percentInViewV = contentHeight / paneHeight;

        if (isScrollableH) {
          horizontalDragWidth = Math.ceil(1 / percentInViewH * horizontalTrackWidth);
          if (horizontalDragWidth > settings.horizontalDragMaxWidth) {
            horizontalDragWidth = settings.horizontalDragMaxWidth;
          } else if (horizontalDragWidth < settings.horizontalDragMinWidth) {
            horizontalDragWidth = settings.horizontalDragMinWidth;
          }
          horizontalDrag.width(horizontalDragWidth + 'px');
          dragMaxX = horizontalTrackWidth - horizontalDragWidth;
          _positionDragX(horizontalDragPosition); // To update the state for the arrow buttons
        }
        if (isScrollableV) {
          verticalDragHeight = Math.ceil(1 / percentInViewV * verticalTrackHeight);
          if (verticalDragHeight > settings.verticalDragMaxHeight) {
            verticalDragHeight = settings.verticalDragMaxHeight;
          } else if (verticalDragHeight < settings.verticalDragMinHeight) {
            verticalDragHeight = settings.verticalDragMinHeight;
          }
          verticalDrag.height(verticalDragHeight + 'px');
          dragMaxY = verticalTrackHeight - verticalDragHeight;
          _positionDragY(verticalDragPosition); // To update the state for the arrow buttons
        }
      }

      function appendArrows(ele, p, a1, a2)
      {
        var p1 = "before", p2 = "after", aTemp;
        
        // Sniff for mac... Is there a better way to determine whether the arrows would naturally appear
        // at the top or the bottom of the bar?
        if (p == "os") {
          p = /Mac/.test(navigator.platform) ? "after" : "split";
        }
        if (p == p1) {
          p2 = p;
        } else if (p == p2) {
          p1 = p;
          aTemp = a1;
          a1 = a2;
          a2 = aTemp;
        }

        ele[p1](a1)[p2](a2);
      }

      function getArrowScroll(dirX, dirY, ele)
      {
        return function()
        {
          arrowScroll(dirX, dirY, this, ele);
          this.blur();
          return false;
        };
      }

      function arrowScroll(dirX, dirY, arrow, ele)
      {
        arrow = $(arrow).addClass('jspActive');

        var eve,
          scrollTimeout,
          isFirst = true,
          doScroll = function()
          {
            if (dirX !== 0) {
              jsp.scrollByX(dirX * settings.arrowButtonSpeed);
            }
            if (dirY !== 0) {
              jsp.scrollByY(dirY * settings.arrowButtonSpeed);
            }
            scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.arrowRepeatFreq);
            isFirst = false;
          };

        doScroll();

        eve = ele ? 'mouseout.jsp' : 'mouseup.jsp';
        ele = ele || $('html');
        ele.bind(
          eve,
          function()
          {
            arrow.removeClass('jspActive');
            scrollTimeout && clearTimeout(scrollTimeout);
            scrollTimeout = null;
            ele.unbind(eve);
          }
        );
      }

      function initClickOnTrack()
      {
        removeClickOnTrack();
        if (isScrollableV) {
          verticalTrack.bind(
            'mousedown.jsp',
            function(e)
            {
              if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
                var clickedTrack = $(this),
                  offset = clickedTrack.offset(),
                  direction = e.pageY - offset.top - verticalDragPosition,
                  scrollTimeout,
                  isFirst = true,
                  doScroll = function()
                  {
                    var offset = clickedTrack.offset(),
                      pos = e.pageY - offset.top - verticalDragHeight / 2,
                      contentDragY = paneHeight * settings.scrollPagePercent,
                      dragY = dragMaxY * contentDragY / (contentHeight - paneHeight);
                    if (direction < 0) {
                      if (verticalDragPosition - dragY > pos) {
                        jsp.scrollByY(-contentDragY);
                      } else {
                        positionDragY(pos);
                      }
                    } else if (direction > 0) {
                      if (verticalDragPosition + dragY < pos) {
                        jsp.scrollByY(contentDragY);
                      } else {
                        positionDragY(pos);
                      }
                    } else {
                      cancelClick();
                      return;
                    }
                    scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
                    isFirst = false;
                  },
                  cancelClick = function()
                  {
                    scrollTimeout && clearTimeout(scrollTimeout);
                    scrollTimeout = null;
                    $(document).unbind('mouseup.jsp', cancelClick);
                  };
                doScroll();
                $(document).bind('mouseup.jsp', cancelClick);
                return false;
              }
            }
          );
        }
        
        if (isScrollableH) {
          horizontalTrack.bind(
            'mousedown.jsp',
            function(e)
            {
              if (e.originalTarget === undefined || e.originalTarget == e.currentTarget) {
                var clickedTrack = $(this),
                  offset = clickedTrack.offset(),
                  direction = e.pageX - offset.left - horizontalDragPosition,
                  scrollTimeout,
                  isFirst = true,
                  doScroll = function()
                  {
                    var offset = clickedTrack.offset(),
                      pos = e.pageX - offset.left - horizontalDragWidth / 2,
                      contentDragX = paneWidth * settings.scrollPagePercent,
                      dragX = dragMaxX * contentDragX / (contentWidth - paneWidth);
                    if (direction < 0) {
                      if (horizontalDragPosition - dragX > pos) {
                        jsp.scrollByX(-contentDragX);
                      } else {
                        positionDragX(pos);
                      }
                    } else if (direction > 0) {
                      if (horizontalDragPosition + dragX < pos) {
                        jsp.scrollByX(contentDragX);
                      } else {
                        positionDragX(pos);
                      }
                    } else {
                      cancelClick();
                      return;
                    }
                    scrollTimeout = setTimeout(doScroll, isFirst ? settings.initialDelay : settings.trackClickRepeatFreq);
                    isFirst = false;
                  },
                  cancelClick = function()
                  {
                    scrollTimeout && clearTimeout(scrollTimeout);
                    scrollTimeout = null;
                    $(document).unbind('mouseup.jsp', cancelClick);
                  };
                doScroll();
                $(document).bind('mouseup.jsp', cancelClick);
                return false;
              }
            }
          );
        }
      }

      function removeClickOnTrack()
      {
        if (horizontalTrack) {
          horizontalTrack.unbind('mousedown.jsp');
        }
        if (verticalTrack) {
          verticalTrack.unbind('mousedown.jsp');
        }
      }

      function cancelDrag()
      {
        $('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');

        if (verticalDrag) {
          verticalDrag.removeClass('jspActive');
        }
        if (horizontalDrag) {
          horizontalDrag.removeClass('jspActive');
        }
      }

      function positionDragY(destY, animate)
      {
        if (!isScrollableV) {
          return;
        }
        if (destY < 0) {
          destY = 0;
        } else if (destY > dragMaxY) {
          destY = dragMaxY;
        }

        // can't just check if(animate) because false is a valid value that could be passed in...
        if (animate === undefined) {
          animate = settings.animateScroll;
        }
        if (animate) {
          jsp.animate(verticalDrag, 'top', destY, _positionDragY);
        } else {
          verticalDrag.css('top', destY);
          _positionDragY(destY);
        }

      }

      function _positionDragY(destY)
      {
        if (destY === undefined) {
          destY = verticalDrag.position().top;
        }

        container.scrollTop(0);
        verticalDragPosition = destY;

        var isAtTop = verticalDragPosition === 0,
          isAtBottom = verticalDragPosition == dragMaxY,
          percentScrolled = destY/ dragMaxY,
          destTop = -percentScrolled * (contentHeight - paneHeight);

        if (wasAtTop != isAtTop || wasAtBottom != isAtBottom) {
          wasAtTop = isAtTop;
          wasAtBottom = isAtBottom;
          elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
        }
        
        updateVerticalArrows(isAtTop, isAtBottom);
        pane.css('top', destTop);
        elem.trigger('jsp-scroll-y', [-destTop, isAtTop, isAtBottom]).trigger('scroll');
      }

      function positionDragX(destX, animate)
      {
        if (!isScrollableH) {
          return;
        }
        if (destX < 0) {
          destX = 0;
        } else if (destX > dragMaxX) {
          destX = dragMaxX;
        }

        if (animate === undefined) {
          animate = settings.animateScroll;
        }
        if (animate) {
          jsp.animate(horizontalDrag, 'left', destX,  _positionDragX);
        } else {
          horizontalDrag.css('left', destX);
          _positionDragX(destX);
        }
      }

      function _positionDragX(destX)
      {
        if (destX === undefined) {
          destX = horizontalDrag.position().left;
        }

        container.scrollTop(0);
        horizontalDragPosition = destX;

        var isAtLeft = horizontalDragPosition === 0,
          isAtRight = horizontalDragPosition == dragMaxX,
          percentScrolled = destX / dragMaxX,
          destLeft = -percentScrolled * (contentWidth - paneWidth);

        if (wasAtLeft != isAtLeft || wasAtRight != isAtRight) {
          wasAtLeft = isAtLeft;
          wasAtRight = isAtRight;
          elem.trigger('jsp-arrow-change', [wasAtTop, wasAtBottom, wasAtLeft, wasAtRight]);
        }
        
        updateHorizontalArrows(isAtLeft, isAtRight);
        pane.css('left', destLeft);
        elem.trigger('jsp-scroll-x', [-destLeft, isAtLeft, isAtRight]).trigger('scroll');
      }

      function updateVerticalArrows(isAtTop, isAtBottom)
      {
        if (settings.showArrows) {
          arrowUp[isAtTop ? 'addClass' : 'removeClass']('jspDisabled');
          arrowDown[isAtBottom ? 'addClass' : 'removeClass']('jspDisabled');
        }
      }

      function updateHorizontalArrows(isAtLeft, isAtRight)
      {
        if (settings.showArrows) {
          arrowLeft[isAtLeft ? 'addClass' : 'removeClass']('jspDisabled');
          arrowRight[isAtRight ? 'addClass' : 'removeClass']('jspDisabled');
        }
      }

      function scrollToY(destY, animate)
      {
        var percentScrolled = destY / (contentHeight - paneHeight);
        positionDragY(percentScrolled * dragMaxY, animate);
      }

      function scrollToX(destX, animate)
      {
        var percentScrolled = destX / (contentWidth - paneWidth);
        positionDragX(percentScrolled * dragMaxX, animate);
      }

      function scrollToElement(ele, stickToTop, animate)
      {
        var e, eleHeight, eleWidth, eleTop = 0, eleLeft = 0, viewportTop, viewportLeft, maxVisibleEleTop, maxVisibleEleLeft, destY, destX;

        // Legal hash values aren't necessarily legal jQuery selectors so we need to catch any
        // errors from the lookup...
        try {
          e = $(ele);
        } catch (err) {
          return;
        }
        eleHeight = e.outerHeight();
        eleWidth= e.outerWidth();

        container.scrollTop(0);
        container.scrollLeft(0);
        
        // loop through parents adding the offset top of any elements that are relatively positioned between
        // the focused element and the jspPane so we can get the true distance from the top
        // of the focused element to the top of the scrollpane...
        while (!e.is('.jspPane')) {
          eleTop += e.position().top;
          eleLeft += e.position().left;
          e = e.offsetParent();
          if (/^body|html$/i.test(e[0].nodeName)) {
            // we ended up too high in the document structure. Quit!
            return;
          }
        }

        viewportTop = contentPositionY();
        maxVisibleEleTop = viewportTop + paneHeight;
        if (eleTop < viewportTop || stickToTop) { // element is above viewport
          destY = eleTop - settings.verticalGutter;
        } else if (eleTop + eleHeight > maxVisibleEleTop) { // element is below viewport
          destY = eleTop - paneHeight + eleHeight + settings.verticalGutter;
        }
        if (destY) {
          scrollToY(destY, animate);
        }
        
        viewportLeft = contentPositionX();
              maxVisibleEleLeft = viewportLeft + paneWidth;
              if (eleLeft < viewportLeft || stickToTop) { // element is to the left of viewport
                  destX = eleLeft - settings.horizontalGutter;
              } else if (eleLeft + eleWidth > maxVisibleEleLeft) { // element is to the right viewport
                  destX = eleLeft - paneWidth + eleWidth + settings.horizontalGutter;
              }
              if (destX) {
                  scrollToX(destX, animate);
              }

      }

      function contentPositionX()
      {
        return -pane.position().left;
      }

      function contentPositionY()
      {
        return -pane.position().top;
      }

      function isCloseToBottom()
      {
        var scrollableHeight = contentHeight - paneHeight;
        return (scrollableHeight > 20) && (scrollableHeight - contentPositionY() < 10);
      }

      function isCloseToRight()
      {
        var scrollableWidth = contentWidth - paneWidth;
        return (scrollableWidth > 20) && (scrollableWidth - contentPositionX() < 10);
      }

      function initMousewheel()
      {
        container.unbind(mwEvent).bind(
          mwEvent,
          function (event, delta, deltaX, deltaY) {
            var dX = horizontalDragPosition, dY = verticalDragPosition;
            jsp.scrollBy(deltaX * settings.mouseWheelSpeed, -deltaY * settings.mouseWheelSpeed, false);
            // return true if there was no movement so rest of screen can scroll
            return dX == horizontalDragPosition && dY == verticalDragPosition;
          }
        );
      }

      function removeMousewheel()
      {
        container.unbind(mwEvent);
      }

      function nil()
      {
        return false;
      }

      function initFocusHandler()
      {
        pane.find(':input,a').unbind('focus.jsp').bind(
          'focus.jsp',
          function(e)
          {
            scrollToElement(e.target, false);
          }
        );
      }

      function removeFocusHandler()
      {
        pane.find(':input,a').unbind('focus.jsp');
      }
      
      function initKeyboardNav()
      {
        var keyDown, elementHasScrolled, validParents = [];
        isScrollableH && validParents.push(horizontalBar[0]);
        isScrollableV && validParents.push(verticalBar[0]);
        
        // IE also focuses elements that don't have tabindex set.
        pane.focus(
          function()
          {
            elem.focus();
          }
        );
        
        elem.attr('tabindex', 0)
          .unbind('keydown.jsp keypress.jsp')
          .bind(
            'keydown.jsp',
            function(e)
            {
              if (e.target !== this && !(validParents.length && $(e.target).closest(validParents).length)){
                return;
              }
              var dX = horizontalDragPosition, dY = verticalDragPosition;
              switch(e.keyCode) {
                case 40: // down
                case 38: // up
                case 34: // page down
                case 32: // space
                case 33: // page up
                case 39: // right
                case 37: // left
                  keyDown = e.keyCode;
                  keyDownHandler();
                  break;
                case 35: // end
                  scrollToY(contentHeight - paneHeight);
                  keyDown = null;
                  break;
                case 36: // home
                  scrollToY(0);
                  keyDown = null;
                  break;
              }

              elementHasScrolled = e.keyCode == keyDown && dX != horizontalDragPosition || dY != verticalDragPosition;
              return !elementHasScrolled;
            }
          ).bind(
            'keypress.jsp', // For FF/ OSX so that we can cancel the repeat key presses if the JSP scrolls...
            function(e)
            {
              if (e.keyCode == keyDown) {
                keyDownHandler();
              }
              return !elementHasScrolled;
            }
          );
        
        if (settings.hideFocus) {
          elem.css('outline', 'none');
          if ('hideFocus' in container[0]){
            elem.attr('hideFocus', true);
          }
        } else {
          elem.css('outline', '');
          if ('hideFocus' in container[0]){
            elem.attr('hideFocus', false);
          }
        }
        
        function keyDownHandler()
        {
          var dX = horizontalDragPosition, dY = verticalDragPosition;
          switch(keyDown) {
            case 40: // down
              jsp.scrollByY(settings.keyboardSpeed, false);
              break;
            case 38: // up
              jsp.scrollByY(-settings.keyboardSpeed, false);
              break;
            case 34: // page down
            case 32: // space
              jsp.scrollByY(paneHeight * settings.scrollPagePercent, false);
              break;
            case 33: // page up
              jsp.scrollByY(-paneHeight * settings.scrollPagePercent, false);
              break;
            case 39: // right
              jsp.scrollByX(settings.keyboardSpeed, false);
              break;
            case 37: // left
              jsp.scrollByX(-settings.keyboardSpeed, false);
              break;
          }

          elementHasScrolled = dX != horizontalDragPosition || dY != verticalDragPosition;
          return elementHasScrolled;
        }
      }
      
      function removeKeyboardNav()
      {
        elem.attr('tabindex', '-1')
          .removeAttr('tabindex')
          .unbind('keydown.jsp keypress.jsp');
      }

      function observeHash()
      {
        if (location.hash && location.hash.length > 1) {
          var e,
            retryInt,
            hash = escape(location.hash.substr(1)) // hash must be escaped to prevent XSS
            ;
          try {
            e = $('#' + hash + ', a[name="' + hash + '"]');
          } catch (err) {
            return;
          }

          if (e.length && pane.find(hash)) {
            // nasty workaround but it appears to take a little while before the hash has done its thing
            // to the rendered page so we just wait until the container's scrollTop has been messed up.
            if (container.scrollTop() === 0) {
              retryInt = setInterval(
                function()
                {
                  if (container.scrollTop() > 0) {
                    scrollToElement(e, true);
                    $(document).scrollTop(container.position().top);
                    clearInterval(retryInt);
                  }
                },
                50
              );
            } else {
              scrollToElement(e, true);
              $(document).scrollTop(container.position().top);
            }
          }
        }
      }

      function hijackInternalLinks()
      {
        // only register the link handler once
        if ($(document.body).data('jspHijack')) {
          return;
        }

        // remember that the handler was bound
        $(document.body).data('jspHijack', true);

        // use live handler to also capture newly created links
        $(document.body).delegate('a[href*=#]', 'click', function(event) {
          // does the link point to the same page?
          // this also takes care of cases with a <base>-Tag or Links not starting with the hash #
          // e.g. <a href="index.html#test"> when the current url already is index.html
          var href = this.href.substr(0, this.href.indexOf('#')),
            locationHref = location.href,
            hash,
            element,
            container,
            jsp,
            scrollTop,
            elementTop;
          if (location.href.indexOf('#') !== -1) {
            locationHref = location.href.substr(0, location.href.indexOf('#'));
          }
          if (href !== locationHref) {
            // the link points to another page
            return;
          }

          // check if jScrollPane should handle this click event
          hash = escape(this.href.substr(this.href.indexOf('#') + 1));

          // find the element on the page
          element;
          try {
            element = $('#' + hash + ', a[name="' + hash + '"]');
          } catch (e) {
            // hash is not a valid jQuery identifier
            return;
          }

          if (!element.length) {
            // this link does not point to an element on this page
            return;
          }

          container = element.closest('.jspScrollable');
          jsp = container.data('jsp');

          // jsp might be another jsp instance than the one, that bound this event
          // remember: this event is only bound once for all instances.
          jsp.scrollToElement(element, true);

          if (container[0].scrollIntoView) {
            // also scroll to the top of the container (if it is not visible)
            scrollTop = $(window).scrollTop();
            elementTop = element.offset().top;
            if (elementTop < scrollTop || elementTop > scrollTop + $(window).height()) {
              container[0].scrollIntoView();
            }
          }

          // jsp handled this event, prevent the browser default (scrolling :P)
          event.preventDefault();
        });
      }
      
      // Init touch on iPad, iPhone, iPod, Android
      function initTouch()
      {
        var startX,
          startY,
          touchStartX,
          touchStartY,
          moved,
          moving = false;
  
        container.unbind('touchstart.jsp touchmove.jsp touchend.jsp click.jsp-touchclick').bind(
          'touchstart.jsp',
          function(e)
          {
            var touch = e.originalEvent.touches[0];
            startX = contentPositionX();
            startY = contentPositionY();
            touchStartX = touch.pageX;
            touchStartY = touch.pageY;
            moved = false;
            moving = true;
          }
        ).bind(
          'touchmove.jsp',
          function(ev)
          {
            if(!moving) {
              return;
            }
            
            var touchPos = ev.originalEvent.touches[0],
              dX = horizontalDragPosition, dY = verticalDragPosition;
            
            jsp.scrollTo(startX + touchStartX - touchPos.pageX, startY + touchStartY - touchPos.pageY);
            
            moved = moved || Math.abs(touchStartX - touchPos.pageX) > 5 || Math.abs(touchStartY - touchPos.pageY) > 5;
            
            // return true if there was no movement so rest of screen can scroll
            return dX == horizontalDragPosition && dY == verticalDragPosition;
          }
        ).bind(
          'touchend.jsp',
          function(e)
          {
            moving = false;
            /*if(moved) {
              return false;
            }*/
          }
        ).bind(
          'click.jsp-touchclick',
          function(e)
          {
            if(moved) {
              moved = false;
              return false;
            }
          }
        );
      }
      
      function destroy(){
        var currentY = contentPositionY(),
          currentX = contentPositionX();
        elem.removeClass('jspScrollable').unbind('.jsp');
        elem.replaceWith(originalElement.append(pane.children()));
        originalElement.scrollTop(currentY);
        originalElement.scrollLeft(currentX);

        // clear reinitialize timer if active
        if (reinitialiseInterval) {
          clearInterval(reinitialiseInterval);
        }
      }

      // Public API
      $.extend(
        jsp,
        {
          // Reinitialises the scroll pane (if it's internal dimensions have changed since the last time it
          // was initialised). The settings object which is passed in will override any settings from the
          // previous time it was initialised - if you don't pass any settings then the ones from the previous
          // initialisation will be used.
          reinitialise: function(s)
          {
            s = $.extend({}, settings, s);
            initialise(s);
          },
          // Scrolls the specified element (a jQuery object, DOM node or jQuery selector string) into view so
          // that it can be seen within the viewport. If stickToTop is true then the element will appear at
          // the top of the viewport, if it is false then the viewport will scroll as little as possible to
          // show the element. You can also specify if you want animation to occur. If you don't provide this
          // argument then the animateScroll value from the settings object is used instead.
          scrollToElement: function(ele, stickToTop, animate)
          {
            scrollToElement(ele, stickToTop, animate);
          },
          // Scrolls the pane so that the specified co-ordinates within the content are at the top left
          // of the viewport. animate is optional and if not passed then the value of animateScroll from
          // the settings object this jScrollPane was initialised with is used.
          scrollTo: function(destX, destY, animate)
          {
            scrollToX(destX, animate);
            scrollToY(destY, animate);
          },
          // Scrolls the pane so that the specified co-ordinate within the content is at the left of the
          // viewport. animate is optional and if not passed then the value of animateScroll from the settings
          // object this jScrollPane was initialised with is used.
          scrollToX: function(destX, animate)
          {
            scrollToX(destX, animate);
          },
          // Scrolls the pane so that the specified co-ordinate within the content is at the top of the
          // viewport. animate is optional and if not passed then the value of animateScroll from the settings
          // object this jScrollPane was initialised with is used.
          scrollToY: function(destY, animate)
          {
            scrollToY(destY, animate);
          },
          // Scrolls the pane to the specified percentage of its maximum horizontal scroll position. animate
          // is optional and if not passed then the value of animateScroll from the settings object this
          // jScrollPane was initialised with is used.
          scrollToPercentX: function(destPercentX, animate)
          {
            scrollToX(destPercentX * (contentWidth - paneWidth), animate);
          },
          // Scrolls the pane to the specified percentage of its maximum vertical scroll position. animate
          // is optional and if not passed then the value of animateScroll from the settings object this
          // jScrollPane was initialised with is used.
          scrollToPercentY: function(destPercentY, animate)
          {
            scrollToY(destPercentY * (contentHeight - paneHeight), animate);
          },
          // Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
          // the value of animateScroll from the settings object this jScrollPane was initialised with is used.
          scrollBy: function(deltaX, deltaY, animate)
          {
            jsp.scrollByX(deltaX, animate);
            jsp.scrollByY(deltaY, animate);
          },
          // Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
          // the value of animateScroll from the settings object this jScrollPane was initialised with is used.
          scrollByX: function(deltaX, animate)
          {
            var destX = contentPositionX() + Math[deltaX<0 ? 'floor' : 'ceil'](deltaX),
              percentScrolled = destX / (contentWidth - paneWidth);
            positionDragX(percentScrolled * dragMaxX, animate);
          },
          // Scrolls the pane by the specified amount of pixels. animate is optional and if not passed then
          // the value of animateScroll from the settings object this jScrollPane was initialised with is used.
          scrollByY: function(deltaY, animate)
          {
            var destY = contentPositionY() + Math[deltaY<0 ? 'floor' : 'ceil'](deltaY),
              percentScrolled = destY / (contentHeight - paneHeight);
            positionDragY(percentScrolled * dragMaxY, animate);
          },
          // Positions the horizontal drag at the specified x position (and updates the viewport to reflect
          // this). animate is optional and if not passed then the value of animateScroll from the settings
          // object this jScrollPane was initialised with is used.
          positionDragX: function(x, animate)
          {
            positionDragX(x, animate);
          },
          // Positions the vertical drag at the specified y position (and updates the viewport to reflect
          // this). animate is optional and if not passed then the value of animateScroll from the settings
          // object this jScrollPane was initialised with is used.
          positionDragY: function(y, animate)
          {
            positionDragY(y, animate);
          },
          // This method is called when jScrollPane is trying to animate to a new position. You can override
          // it if you want to provide advanced animation functionality. It is passed the following arguments:
          //  * ele          - the element whose position is being animated
          //  * prop         - the property that is being animated
          //  * value        - the value it's being animated to
          //  * stepCallback - a function that you must execute each time you update the value of the property
          // You can use the default implementation (below) as a starting point for your own implementation.
          animate: function(ele, prop, value, stepCallback)
          {
            var params = {};
            params[prop] = value;
            ele.animate(
              params,
              {
                'duration'  : settings.animateDuration,
                'easing'  : settings.animateEase,
                'queue'   : false,
                'step'    : stepCallback
              }
            );
          },
          // Returns the current x position of the viewport with regards to the content pane.
          getContentPositionX: function()
          {
            return contentPositionX();
          },
          // Returns the current y position of the viewport with regards to the content pane.
          getContentPositionY: function()
          {
            return contentPositionY();
          },
          // Returns the width of the content within the scroll pane.
          getContentWidth: function()
          {
            return contentWidth;
          },
          // Returns the height of the content within the scroll pane.
          getContentHeight: function()
          {
            return contentHeight;
          },
          // Returns the horizontal position of the viewport within the pane content.
          getPercentScrolledX: function()
          {
            return contentPositionX() / (contentWidth - paneWidth);
          },
          // Returns the vertical position of the viewport within the pane content.
          getPercentScrolledY: function()
          {
            return contentPositionY() / (contentHeight - paneHeight);
          },
          // Returns whether or not this scrollpane has a horizontal scrollbar.
          getIsScrollableH: function()
          {
            return isScrollableH;
          },
          // Returns whether or not this scrollpane has a vertical scrollbar.
          getIsScrollableV: function()
          {
            return isScrollableV;
          },
          // Gets a reference to the content pane. It is important that you use this method if you want to
          // edit the content of your jScrollPane as if you access the element directly then you may have some
          // problems (as your original element has had additional elements for the scrollbars etc added into
          // it).
          getContentPane: function()
          {
            return pane;
          },
          // Scrolls this jScrollPane down as far as it can currently scroll. If animate isn't passed then the
          // animateScroll value from settings is used instead.
          scrollToBottom: function(animate)
          {
            positionDragY(dragMaxY, animate);
          },
          // Hijacks the links on the page which link to content inside the scrollpane. If you have changed
          // the content of your page (e.g. via AJAX) and want to make sure any new anchor links to the
          // contents of your scroll pane will work then call this function.
          hijackInternalLinks: $.noop,
          // Removes the jScrollPane and returns the page to the state it was in before jScrollPane was
          // initialised.
          destroy: function()
          {
              destroy();
          }
        }
      );
      
      initialise(s);
    }

    // Pluginifying code...
    settings = $.extend({}, $.fn.jScrollPane.defaults, settings);
    
    // Apply default speed
    $.each(['mouseWheelSpeed', 'arrowButtonSpeed', 'trackClickSpeed', 'keyboardSpeed'], function() {
      settings[this] = settings[this] || settings.speed;
    });

    return this.each(
      function()
      {
        var elem = $(this), jspApi = elem.data('jsp');
        if (jspApi) {
          jspApi.reinitialise(settings);
        } else {
          $("script",elem).filter('[type="text/javascript"],:not([type])').remove();
          jspApi = new JScrollPane(elem, settings);
          elem.data('jsp', jspApi);
        }
      }
    );
  };

  $.fn.jScrollPane.defaults = {
    showArrows          : false,
    maintainPosition      : true,
    stickToBottom       : false,
    stickToRight        : false,
    clickOnTrack        : true,
    autoReinitialise      : false,
    autoReinitialiseDelay   : 500,
    verticalDragMinHeight   : 0,
    verticalDragMaxHeight   : 99999,
    horizontalDragMinWidth    : 0,
    horizontalDragMaxWidth    : 99999,
    contentWidth        : undefined,
    animateScroll       : false,
    animateDuration       : 300,
    animateEase         : 'linear',
    hijackInternalLinks     : false,
    verticalGutter        : 4,
    horizontalGutter      : 4,
    mouseWheelSpeed       : 0,
    arrowButtonSpeed      : 0,
    arrowRepeatFreq       : 50,
    arrowScrollOnHover      : false,
    trackClickSpeed       : 0,
    trackClickRepeatFreq    : 70,
    verticalArrowPositions    : 'split',
    horizontalArrowPositions  : 'split',
    enableKeyboardNavigation  : true,
    hideFocus         : false,
    keyboardSpeed       : 0,
    initialDelay                : 300,        // Delay before starting repeating
    speed           : 30,   // Default speed when others falsey
    scrollPagePercent     : .8    // Percent of visible area scrolled when pageUp/Down or track area pressed
  };

})(jQuery,this);
/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);/**
 * @author trixta
 * @version 1.2
 */
(function($){

var mwheelI = {
      pos: [-260, -260]
    },
  minDif  = 3,
  doc   = document,
  root  = doc.documentElement,
  body  = doc.body,
  longDelay, shortDelay
;

function unsetPos(){
  if(this === mwheelI.elem){
    mwheelI.pos = [-260, -260];
    mwheelI.elem = false;
    minDif = 3;
  }
}

$.event.special.mwheelIntent = {
  setup: function(){
    var jElm = $(this).bind('mousewheel', $.event.special.mwheelIntent.handler);
    if( this !== doc && this !== root && this !== body ){
      jElm.bind('mouseleave', unsetPos);
    }
    jElm = null;
        return true;
    },
  teardown: function(){
        $(this)
      .unbind('mousewheel', $.event.special.mwheelIntent.handler)
      .unbind('mouseleave', unsetPos)
    ;
        return true;
    },
    handler: function(e, d){
    var pos = [e.clientX, e.clientY];
    if( this === mwheelI.elem || Math.abs(mwheelI.pos[0] - pos[0]) > minDif || Math.abs(mwheelI.pos[1] - pos[1]) > minDif ){
            mwheelI.elem = this;
      mwheelI.pos = pos;
      minDif = 250;
      
      clearTimeout(shortDelay);
      shortDelay = setTimeout(function(){
        minDif = 10;
      }, 200);
      clearTimeout(longDelay);
      longDelay = setTimeout(function(){
        minDif = 3;
      }, 1500);
      e = $.extend({}, e, {type: 'mwheelIntent'});
            return $.event.handle.apply(this, arguments);
    }
    }
};
$.fn.extend({
  mwheelIntent: function(fn) {
    return fn ? this.bind("mwheelIntent", fn) : this.trigger("mwheelIntent");
  },
  
  unmwheelIntent: function(fn) {
    return this.unbind("mwheelIntent", fn);
  }
});

$(function(){
  body = doc.body;
  //assume that document is always scrollable, doesn't hurt if not
  $(doc).bind('mwheelIntent.mwheelIntentDefault', $.noop);
});
})(jQuery);//fgnass.github.com/spin.js#v1.2.5
(function(a,b,c){function g(a,c){var d=b.createElement(a||"div"),e;for(e in c)d[e]=c[e];return d}function h(a){for(var b=1,c=arguments.length;b<c;b++)a.appendChild(arguments[b]);return a}function j(a,b,c,d){var g=["opacity",b,~~(a*100),c,d].join("-"),h=.01+c/d*100,j=Math.max(1-(1-a)/b*(100-h),a),k=f.substring(0,f.indexOf("Animation")).toLowerCase(),l=k&&"-"+k+"-"||"";return e[g]||(i.insertRule("@"+l+"keyframes "+g+"{"+"0%{opacity:"+j+"}"+h+"%{opacity:"+a+"}"+(h+.01)+"%{opacity:1}"+(h+b)%100+"%{opacity:"+a+"}"+"100%{opacity:"+j+"}"+"}",0),e[g]=1),g}function k(a,b){var e=a.style,f,g;if(e[b]!==c)return b;b=b.charAt(0).toUpperCase()+b.slice(1);for(g=0;g<d.length;g++){f=d[g]+b;if(e[f]!==c)return f}}function l(a,b){for(var c in b)a.style[k(a,c)||c]=b[c];return a}function m(a){for(var b=1;b<arguments.length;b++){var d=arguments[b];for(var e in d)a[e]===c&&(a[e]=d[e])}return a}function n(a){var b={x:a.offsetLeft,y:a.offsetTop};while(a=a.offsetParent)b.x+=a.offsetLeft,b.y+=a.offsetTop;return b}var d=["webkit","Moz","ms","O"],e={},f,i=function(){var a=g("style");return h(b.getElementsByTagName("head")[0],a),a.sheet||a.styleSheet}(),o={lines:12,length:7,width:5,radius:10,rotate:0,color:"#000",speed:1,trail:100,opacity:.25,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto"},p=function q(a){if(!this.spin)return new q(a);this.opts=m(a||{},q.defaults,o)};p.defaults={},m(p.prototype,{spin:function(a){this.stop();var b=this,c=b.opts,d=b.el=l(g(0,{className:c.className}),{position:"relative",zIndex:c.zIndex}),e=c.radius+c.length+c.width,h,i;a&&(a.insertBefore(d,a.firstChild||null),i=n(a),h=n(d),l(d,{left:(c.left=="auto"?i.x-h.x+(a.offsetWidth>>1):c.left+e)+"px",top:(c.top=="auto"?i.y-h.y+(a.offsetHeight>>1):c.top+e)+"px"})),d.setAttribute("aria-role","progressbar"),b.lines(d,b.opts);if(!f){var j=0,k=c.fps,m=k/c.speed,o=(1-c.opacity)/(m*c.trail/100),p=m/c.lines;!function q(){j++;for(var a=c.lines;a;a--){var e=Math.max(1-(j+a*p)%m*o,c.opacity);b.opacity(d,c.lines-a,e,c)}b.timeout=b.el&&setTimeout(q,~~(1e3/k))}()}return b},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=c),this},lines:function(a,b){function e(a,d){return l(g(),{position:"absolute",width:b.length+b.width+"px",height:b.width+"px",background:a,boxShadow:d,transformOrigin:"left",transform:"rotate("+~~(360/b.lines*c+b.rotate)+"deg) translate("+b.radius+"px"+",0)",borderRadius:(b.width>>1)+"px"})}var c=0,d;for(;c<b.lines;c++)d=l(g(),{position:"absolute",top:1+~(b.width/2)+"px",transform:b.hwaccel?"translate3d(0,0,0)":"",opacity:b.opacity,animation:f&&j(b.opacity,b.trail,c,b.lines)+" "+1/b.speed+"s linear infinite"}),b.shadow&&h(d,l(e("#000","0 0 4px #000"),{top:"2px"})),h(a,h(d,e(b.color,"0 0 1px rgba(0,0,0,.1)")));return a},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),!function(){function a(a,b){return g("<"+a+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',b)}var b=l(g("group"),{behavior:"url(#default#VML)"});!k(b,"transform")&&b.adj?(i.addRule(".spin-vml","behavior:url(#default#VML)"),p.prototype.lines=function(b,c){function f(){return l(a("group",{coordsize:e+" "+e,coordorigin:-d+" "+ -d}),{width:e,height:e})}function k(b,e,g){h(i,h(l(f(),{rotation:360/c.lines*b+"deg",left:~~e}),h(l(a("roundrect",{arcsize:1}),{width:d,height:c.width,left:c.radius,top:-c.width>>1,filter:g}),a("fill",{color:c.color,opacity:c.opacity}),a("stroke",{opacity:0}))))}var d=c.length+c.width,e=2*d,g=-(c.width+c.length)*2+"px",i=l(f(),{position:"absolute",top:g,left:g}),j;if(c.shadow)for(j=1;j<=c.lines;j++)k(j,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(j=1;j<=c.lines;j++)k(j);return h(b,i)},p.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}):f=k(b,"animation")}(),a.Spinner=p})(window,document);





  // mustache does no defined a global var, defines a var Mustache instead
  // so add it to root
  root.Mustache = Mustache;
  (function() {
    var $ = root.$;
    var L = root.L;
    var Mustache = root.Mustache;
    var Backbone = root.Backbone;
    var _ = root._;


    // entry point
(function() {

    var root = this;

    var cdb = root.cdb = {};

    cdb.VERSION = '2.0.26-dev';

    cdb.CARTOCSS_VERSIONS = {
      '2.0.0': '',
      '2.1.0': ''
    };

    cdb.CARTOCSS_DEFAULT_VERSION = '2.0.0';

    cdb.CDB_HOST = {
      'http': 'tiles.cartocdn.com',
      'https': 'd3pu9mtm6f0hk5.cloudfront.net'
    };

    root.cdb.config = {};
    root.cdb.core = {};
    root.cdb.geo = {};
    root.cdb.geo.ui = {};
    root.cdb.geo.geocoder = {};
    root.cdb.ui = {};
    root.cdb.ui.common = {};
    root.cdb.vis = {};
    root.cdb.decorators = {};
    /**
     * global variables
     */
    root.JST = root.JST || {};
    root.cartodb = cdb;

    cdb.files = [
        "../vendor/jquery.min.js",
        "../vendor/underscore-min.js",
        "../vendor/backbone.js",

        "../vendor/leaflet.js",
        "../vendor/wax.cartodb.js",
        "../vendor/GeoJSON.js", //geojson gmaps lib

        "../vendor/jscrollpane.js",
        "../vendor/mousewheel.js",
        "../vendor/mwheelIntent.js",
        "../vendor/spin.js",

        'core/decorator.js',
        'core/config.js',
        'core/log.js',
        'core/profiler.js',
        'core/template.js',
        'core/model.js',
        'core/view.js',

        'geo/geocoder.js',
        'geo/geometry.js',
        'geo/map.js',
        'geo/ui/zoom.js',
        'geo/ui/zoom_info.js',
        'geo/ui/legend.js',
        'geo/ui/switcher.js',
        'geo/ui/infowindow.js',
        'geo/ui/header.js',
        'geo/ui/search.js',
        'geo/ui/tiles_loader.js',
        'geo/ui/infobox.js',
        'geo/ui/tooltip.js',

        'geo/common.js',

        'geo/leaflet/leaflet.geometry.js',
        'geo/leaflet/leaflet_base.js',
        'geo/leaflet/leaflet_plainlayer.js',
        'geo/leaflet/leaflet_tiledlayer.js',
        'geo/leaflet/leaflet_cartodb_layer.js',
        'geo/leaflet/leaflet.js',


        'geo/gmaps/gmaps_base.js',
        'geo/gmaps/gmaps_baselayer.js',
        'geo/gmaps/gmaps_plainlayer.js',
        'geo/gmaps/gmaps_tiledlayer.js',
        'geo/gmaps/gmaps_cartodb_layer.js',
        'geo/gmaps/gmaps.js',

        'ui/common/dialog.js',
        'ui/common/notification.js',
        'ui/common/table.js',

        'vis/vis.js',
        'vis/overlays.js',
        'vis/layers.js',

        // PUBLIC API
        'api/layers.js',
        'api/sql.js',
        'api/vis.js'
    ];

    cdb.init = function(ready) {
      // define a simple class
      var Class = cdb.Class = function() {};
      _.extend(Class.prototype, Backbone.Events);

      cdb._loadJST();
      root.cdb.god = new Backbone.Model();

      ready && ready();
    };

    /**
     * load all the javascript files. For testing, do not use in production
     */
    cdb.load = function(prefix, ready) {
        var c = 0;

        var next = function() {
            var script = document.createElement('script');
            script.src = prefix + cdb.files[c];
            document.body.appendChild(script);
            ++c;
            if(c == cdb.files.length) {
                if(ready) {
                    script.onload = ready;
                }
            } else {
                script.onload = next;
            }
        };

        next();

    };
})();
/**
* Decorators to extend funcionality of cdb related objects
*/

/**
* Adds .elder method to call for the same method of the parent class
* usage:
*   insanceOfClass.elder('name_of_the_method');
*/
cdb.decorators.elder = (function() {
  // we need to backup one of the backbone extend models
  // (it doesn't matter which, they are all the same method)
  var backboneExtend = Backbone.Router.extend;
  var superMethod = function(method, options) {
      var result = null;
      if (this.parent != null) {
          var currentParent = this.parent;
          // we need to change the parent of "this", because
          // since we are going to call the elder (super) method
          // in the context of "this", if the super method has
          // another call to elder (super), we need to provide a way of
          // redirecting to the grandparent
          this.parent = this.parent.parent;
          var options = Array.prototype.slice.call(arguments, 1);

          if (currentParent.hasOwnProperty(method)) {
              result = currentParent[method].apply(this, options);
          } else {
              options.splice(0,0, method);
              result = currentParent.elder.apply(this, options);
          }
          this.parent = currentParent;
      }
      return result;
  }
  var extend = function(protoProps, classProps) {
      var child = backboneExtend.call(this, protoProps, classProps);

      child.prototype.parent = this.prototype;
      child.prototype.elder = function(method) {
          var options = Array.prototype.slice.call(arguments, 1);
          if (method) {
              options.splice(0,0, method)
              return superMethod.apply(this, options);
          } else {
              return child.prototype.parent;
          }
      }
      return child;
  };
  var decorate = function(objectToDecorate) {
    objectToDecorate.extend = extend;
    objectToDecorate.prototype.elder = function() {};
    objectToDecorate.prototype.parent = null;
  }
  return decorate;
})()

cdb.decorators.elder(Backbone.Model);
cdb.decorators.elder(Backbone.View);
cdb.decorators.elder(Backbone.Collection);

if(!window.JSON) {
  // shims for ie7
  window.JSON = {
    stringify: function(param) {
      if(typeof param == 'number' || typeof param == 'boolean') {
        return param.toString();
      } else if (typeof param =='string') {
        return '"' + param.toString() + '"';
      } else if(_.isArray(param)) {
        var res = '[';
        for(var n in param) {
          if(n>0) res+=', ';
          res += JSON.stringify(param[n]);
        }
        res += ']'
        return res;
      } else {
        var res = '{';
        for(var p in param) {
          if(param.hasOwnProperty(p)) {
            res += '"'+p+'": '+ JSON.stringify(param[p]);
          }
        }
        res += '}'
        return res;
      }
      // no, we're no gonna stringify regexp, fuckoff.
    },
    parse: function(param) {
      return eval(param);
    }
  }
}
/**
 * global configuration
 */

(function() {

    Config = Backbone.Model.extend({
        VERSION: 2,

        //error track
        REPORT_ERROR_URL: '/api/v0/error',
        ERROR_TRACK_ENABLED: false,

        getSqlApiUrl: function() {
          var url = this.get('sql_api_protocol') + '://' +
            this.get('sql_api_domain') + ':' +
            this.get('sql_api_port');
          return url;
        }


    });

    cdb.config = new Config();

})();
/**
 * logging
 */

(function() {

    // error management
    cdb.core.Error = Backbone.Model.extend({
        url: cdb.config.REPORT_ERROR_URL,
        initialize: function() {
            this.set({browser: JSON.stringify($.browser) });
        }
    });

    cdb.core.ErrorList = Backbone.Collection.extend({
        model: cdb.core.Error
    });

    /** contains all error for the application */
    cdb.errors = new cdb.core.ErrorList();

    // error tracking!
    if(cdb.config.ERROR_TRACK_ENABLED) {
        window.onerror = function(msg, url, line) {
            cdb.errors.create({
                msg: msg,
                url: url,
                line: line
            });
        };
    }


    // logging
    var _fake_console = function() {};
    _fake_console.prototype.error = function(){};
    _fake_console.prototype.log= function(){};

    //IE7 love
    if(typeof console !== "undefined") {
        _console = console;
    } else {
        _console = new _fake_console();
    }

    cdb.core.Log = Backbone.Model.extend({

        error: function() {
            _console.error.apply(_console, arguments);
            cdb.errors.create({
                msg: Array.prototype.slice.call(arguments).join('')
            });
        },

        log: function() {
            _console.log.apply(_console, arguments);
        },

        info: function() {
            _console.log.apply(_console, arguments);
        },

        debug: function() {
            _console.log.apply(_console, arguments);
        }
    });

})();

cdb.log = new cdb.core.Log({tag: 'cdb'});

// =================
// profiler
// =================

(function() {
  function Profiler() {}
  Profiler.times = {};
  Profiler.new_time = function(type, time) {
      var t = Profiler.times[type] = Profiler.times[type] || {
          max: 0,
          min: 10000000,
          avg: 0,
          total: 0,
          count: 0
      };

      t.max = Math.max(t.max, time);
      t.total += time;
      t.min = Math.min(t.min, time);
      ++t.count;
      t.avg = t.total/t.count;
      this.callbacks && this.callbacks[type] && this.callbacks[type](type, time);
  };

  Profiler.new_value = Profiler.new_time;

  Profiler.print_stats = function() {
      for(k in Profiler.times) {
          var t = Profiler.times[k];
          console.log(" === " + k + " === ");
          console.log(" max: " + t.max);
          console.log(" min: " + t.min);
          console.log(" avg: " + t.avg);
          console.log(" total: " + t.total);
      }
  };

  Profiler.get = function(type) {
      return {
          t0: null,
          start: function() { this.t0 = new Date().getTime(); },
          end: function() {
              if(this.t0 !== null) {
                  Profiler.new_time(type, this.time = new Date().getTime() - this.t0);
                  this.t0 = null;
              }
          }
      };
  };

  if(typeof(cdb) !== "undefined") {
    cdb.core.Profiler = Profiler;
  } else {
    window.Profiler = Profiler;
  }

  //mini jquery
  var $ = $ || function(id) {
      var $el = {};
      if(id.el) {
        $el.el = id.el;
      } else if(id.clientWidth) {
        $el.el = id;
      } else {
        $el.el = id[0] === '<' ? document.createElement(id.substr(1, id.length - 2)): document.getElementById(id);
      }
      $el.append = function(html) {
        html.el ?  $el.el.appendChild(html.el) : $el.el.innerHTML += html;
        return $el;
      }
      $el.attr = function(k, v) { this.el.setAttribute(k, v); return this;}
      $el.css = function(prop) {
          for(var i in prop) { $el.el.style[i] = prop[i]; }
          return $el;
      }
      $el.width = function() {  return this.el.clientWidth; };
      $el.html = function(h) { $el.el.innerHTML = h; return this; }
      return $el;
  }
  
  function CanvasGraph(w, h) {
      this.el = document.createElement('canvas');
      this.el.width = w;
      this.el.height = h;
      this.el.style.float = 'left';
      this.el.style.border = '3px solid rgba(0,0,0, 0.2)';
      this.ctx = this.el.getContext('2d');

      var barw = w;

      this.value = 0;
      this.max = 0;
      this.min = 0;
      this.pos = 0;
      this.values = [];

      this.reset = function() {
          for(var i = 0; i < barw; ++i){
              this.values[i] = 0;
          }
      }
      this.set_value = function(v) {
          this.value = v;
          this.values[this.pos] = v;
          this.pos = (this.pos + 1)%barw;

          //calculate the max
          this.max = v;
          for(var i = 0; i < barw; ++i){
            var _v = this.values[i];
            this.max = Math.max(this.max, _v);
            //this.min = Math.min(v, _v);
          }
          this.scale = this.max;
          this.render();
      }

      this.render = function() {
          this.el.width = this.el.width;
          for(var i = 0; i < barw; ++i){
              var p = barw - i - 1;
              var v = (this.pos + p)%barw;
              v = 0.9*h*this.values[v]/this.scale;
              this.ctx.fillRect(p, h - v, 1, v);
          }
      }

      this.reset();
  }

  Profiler.ui = function() {
    Profiler.callbacks = {};
    var _$ied;
    if(!_$ied){
        _$ied = $('<div>').css({
          'position': 'fixed',
          'bottom': 10,
          'left': 10,
          'zIndex': 20000,
          'width': $(document.body).width() - 80,
          'border': '1px solid #CCC',
          'padding': '10px 30px',
          'backgroundColor': '#fff',
          'fontFamily': 'helvetica neue,sans-serif',
          'fontSize': '14px',
          'lineHeight': '1.3em'
        });
        $(document.body).append(_$ied);
    }
    this.el = _$ied;
    var update = function() {
        for(k in Profiler.times) {
          var pid = '_prof_time_' + k;
          var p = $(pid);
          if(!p.el) {
            p = $('<div>').attr('id', pid)
            p.css({
              'margin': '0 0 20px 0',
              'border-bottom': '1px solid #EEE'
            });
            var t = Profiler.times[k];
            var div = $('<div>').append('<h1>' + k + '</h1>').css({
              'font-weight': 'bold',
              'margin': '10px 0 30px 0'
            })
            for(var c in t) {
              p.append(
                div.append($('<div>').append('<span style="display: inline-block; width: 60px;font-weight: 300;">' + c + '</span><span style="font-size: 21px" id="'+  k + "-" + c + '"></span>').css({ padding: '5px 0' })));
            }
            _$ied.append(p);
            var graph = new CanvasGraph(250, 100);
            p.append(graph);
            Profiler.callbacks[k] = function(k, v) {
              graph.set_value(v);
            }
          }
          // update ir
          var t = Profiler.times[k];
          for(var c in t) {
            $(k + "-" + c).html(t[c].toFixed(2));
          }
        }
    }
    setInterval(function() {
      update();
    }, 1000);
    /*var $message = $('<li>'+message+' - '+vars+'</li>').css({
        'borderBottom': '1px solid #999999'
      });
      _$ied.find('ol').append($message);
      _.delay(function() {
        $message.fadeOut(500);
      }, 2000);
    };
    */
  };

})();
/**
 * template system
 * usage:
   var tmpl = new cdb.core.Template({
     template: "hi, my name is {{ name }}",
     type: 'mustache' // undescore by default
   });
   console.log(tmpl.render({name: 'rambo'})));
   // prints "hi, my name is rambo"


   you could pass the compiled tempalte directly:

   var tmpl = new cdb.core.Template({
     compiled: function() { return 'my compiled template'; }
   });
 */

cdb.core.Template = Backbone.Model.extend({

  initialize: function() {
    this.bind('change', this._invalidate);
    this._invalidate();
  },

  url: function() {
    return this.get('template_url');
  },

  parse: function(data) {
    return {
      'template': data
    };
  },

  _invalidate: function() {
    this.compiled = null;
    if(this.get('template_url')) {
      this.fetch();
    }
  },

  compile: function() {
    var tmpl_type = this.get('type') || 'underscore';
    var fn = cdb.core.Template.compilers[tmpl_type];
    if(fn) {
      return fn(this.get('template'));
    } else {
      cdb.log.error("can't get rendered for " + tmpl_type);
    }
    return null;
  },

  /**
   * renders the template with specified vars
   */
  render: function(vars) {
    var c = this.compiled = this.compiled || this.get('compiled') || this.compile();
    var r = cdb.core.Profiler.get('template_render');
    r.start();
    var rendered = c(vars);
    r.end();
    return rendered;
  },

  asFunction: function() {
    return _.bind(this.render, this);
  }

}, {
  compilers: {
    'underscore': _.template,
    'mustache': typeof(Mustache) === 'undefined' ? null: Mustache.compile
  },
  compile: function(tmpl, type) {
    var t = new cdb.core.Template({
      template: tmpl,
      type: type || 'underscore'
    });
    return _.bind(t.render, t);
  }
}
);

cdb.core.TemplateList = Backbone.Collection.extend({

  model: cdb.core.Template,

  getTemplate: function(template_name) {

    if (this.namespace) {
      template_name = this.namespace + template_name;
    }

    var t = this.find(function(t) {
        return t.get('name') === template_name;
    });

    if(t) {
      return _.bind(t.render, t);
    }

    cdb.log.error(template_name + " not found");

    return null;
  }
});

/**
 * global variable
 */
cdb.templates = new cdb.core.TemplateList();

/**
 * load JST templates.
 * rails creates a JST variable with all the templates.
 * This functions loads them as default into cbd.template
 */
cdb._loadJST = function() {
  if(typeof(window.JST) !== undefined) {
    cdb.templates.reset(
      _(JST).map(function(tmpl, name) {
        return { name: name, compiled: tmpl };
      })
    );
  }
};

(function() {

  cdb._debugCallbacks= function(o) {
    var callbacks = o._callbacks;
    for(var i in callbacks) {
      var node = callbacks[i];
      console.log(" * ", i);
      var end = node.tail;
      while ((node = node.next) !== end) {
        console.log("    - ", node.context, (node.context && node.context.el) || 'none');
      }
    }
  }

  /**
   * Base Model for all CartoDB model.
   * DO NOT USE Backbone.Model directly
   * @class cdb.core.Model
   */
  var Model = cdb.core.Model = Backbone.Model.extend({

    initialize: function(options) {
      _.bindAll(this, 'fetch',  'save', 'retrigger');
      return Backbone.Model.prototype.initialize.call(this, options);
    },
    /**
    * We are redefining fetch to be able to trigger an event when the ajax call ends, no matter if there's
    * a change in the data or not. Why don't backbone does this by default? ahh, my friend, who knows.
    * @method fetch
    * @param args {Object}
    */
    fetch: function(args) {
      var self = this;
      // var date = new Date();
      this.trigger('loadModelStarted');
      $.when(this.elder('fetch', args)).done(function(ev){
        self.trigger('loadModelCompleted', ev);
        // var dateComplete = new Date()
        // console.log('completed in '+(dateComplete - date));
      }).fail(function(ev) {
        self.trigger('loadModelFailed', ev);
      })
    },
    /**
    * Changes the attribute used as Id
    * @method setIdAttribute
    * @param attr {String}
    */
    setIdAttribute: function(attr) {
      this.idAttribute = attr;
    },
    /**
    * Listen for an event on another object and triggers on itself, with the same name or a new one
    * @method retrigger
    * @param ev {String} event who triggers the action
    * @param obj {Object} object where the event happens
    * @param obj {Object} [optional] name of the retriggered event;
    * @todo [xabel]: This method is repeated here and in the base view definition. There's should be a way to make it unique
    */
    retrigger: function(ev, obj, retrigEvent) {
      if(!retrigEvent) {
        retrigEvent = ev;
      }
      var self = this;
      obj.bind && obj.bind(ev, function() {
        self.trigger(retrigEvent);
      })
    },

    /**
     * We need to override backbone save method to be able to introduce new kind of triggers that
     * for some reason are not present in the original library. Because you know, it would be nice
     * to be able to differenciate "a model has been updated" of "a model is being saved".
     * @param  {object} opt1
     * @param  {object} opt2
     * @return {$.Deferred}
     */
    save: function(opt1, opt2) {
      var self = this;
      if(!opt2 || !opt2.silent) this.trigger('saving');
      $promise = Backbone.Model.prototype.save.call(this, opt1, opt2);
      $.when($promise).done(function() {
        if(!opt2 || !opt2.silent) self.trigger('saved');
      }).fail(function() {
        if(!opt2 || !opt2.silent) self.trigger('errorSaving')
      })
      return $promise;
    }
  });
})();
(function() {

  /**
   * Base View for all CartoDB views.
   * DO NOT USE Backbone.View directly
   */
  var View = cdb.core.View = Backbone.View.extend({
    classLabel: 'cdb.core.View',
    constructor: function(options) {
      this._models = [];
      this._subviews = {};
      Backbone.View.call(this, options);
      View.viewCount++;
      View.views[this.cid] = this;
      this._created_at = new Date();
      cdb.core.Profiler.new_value('total_views', View.viewCount);
    },

    add_related_model: function(m) {
      this._models.push(m);
    },

    addView: function(v) {
      this._subviews[v.cid] = v;
      v._parent = this;
    },

    removeView: function(v) {
      delete this._subviews[v.cid];
    },

    clearSubViews: function() {
      _(this._subviews).each(function(v) {
        v.clean();
      });
      this._subviews = {};
    },

    /**
     * this methid clean removes the view
     * and clean and events associated. call it when
     * the view is not going to be used anymore
     */
    clean: function() {
      var self = this;
      this.trigger('clean');
      this.clearSubViews();
      // remove from parent
      if(this._parent) {
        this._parent.removeView(this);
        this._parent = null;
      }
      this.remove();
      this.unbind();
      // remove model binding
      _(this._models).each(function(m) {
        m.unbind(null, null, self);
      });
      this._models = [];
      View.viewCount--;
      delete View.views[this.cid];
      return this;
    },

    /**
     * utility methods
     */

    getTemplate: function(tmpl) {
      if(this.options.template) {
        return  _.template(this.options.template);
      }
      return cdb.templates.getTemplate(tmpl);
    },

    show: function() {
        this.$el.show();
    },

    hide: function() {
        this.$el.hide();
    },

    /**
    * Listen for an event on another object and triggers on itself, with the same name or a new one
    * @method retrigger
    * @param ev {String} event who triggers the action
    * @param obj {Object} object where the event happens
    * @param obj {Object} [optional] name of the retriggered event;
    */
    retrigger: function(ev, obj, retrigEvent) {
      if(!retrigEvent) {
        retrigEvent = ev;
      }
      var self = this;
      obj.bind && obj.bind(ev, function() {
        self.trigger(retrigEvent);
      }, self)
      // add it as related model//object
      this.add_related_model(obj);
    },
    /**
    * Captures an event and prevents the default behaviour and stops it from bubbling
    * @method killEvent
    * @param event {Event}
    */
    killEvent: function(ev) {
      if(ev && ev.preventDefault) {
        ev.preventDefault();
      };
      if(ev && ev.stopPropagation) {
        ev.stopPropagation();
      };
    },

    /**
    * Remove all the tipsy tooltips from the document
    * @method cleanTooltips
    */
    cleanTooltips: function() {
      $('.tipsy').remove();
    }




  }, {
    viewCount: 0,
    views: {},

    /**
     * when a view with events is inherit and you want to add more events
     * this helper can be used:
     * var MyView = new core.View({
     *  events: cdb.core.View.extendEvents({
     *      'click': 'fn'
     *  })
     * });
     */
    extendEvents: function(newEvents) {
      return function() {
        return _.extend(newEvents, this.constructor.__super__.events);
      };
    },

    /**
     * search for views in a view and check if they are added as subviews
     */
    runChecker: function() {
      _.each(cdb.core.View.views, function(view) {
        _.each(view, function(prop, k) {
          if( k !== '_parent' &&
              view.hasOwnProperty(k) &&
              prop instanceof cdb.core.View &&
              view._subviews[prop.cid] === undefined) {
            console.log("=========");
            console.log("untracked view: ");
            console.log(prop.el);
            console.log('parent');
            console.log(view.el);
            console.log(" ");
          }
        });
      });
    }
  });

})();


/**
 * geocoders for different services
 *
 * should implement a function called geocode the gets
 * the address and call callback with a list of placemarks with lat, lon
 * (at least)
 */

cdb.geo.geocoder.YAHOO = {

  keys: {
    app_id: "nLQPTdTV34FB9L3yK2dCXydWXRv3ZKzyu_BdCSrmCBAM1HgGErsCyCbBbVP2Yg--"
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u')
      .replace(/ /g,'+');

      var protocol = '';
      if(location.protocol.indexOf('http') === -1) {
        protocol = 'http:';
      }

      $.getJSON(protocol + '//query.yahooapis.com/v1/public/yql?q='+encodeURIComponent('SELECT * FROM json WHERE url="http://where.yahooapis.com/geocode?q=' + address + '&appid=' + this.keys.app_id + '&flags=JX"') + '&format=json&callback=?', function(data) {

         var coordinates = [];
         if (data && data.query && data.query.results && data.query.results.json && data.query.results.json.ResultSet && data.query.results.json.ResultSet.Found != "0") {

          // Could be an array or an object |arg!
          var res;

          if (_.isArray(data.query.results.json.ResultSet.Results)) {
            res = data.query.results.json.ResultSet.Results;
          } else {
            res = [data.query.results.json.ResultSet.Results];
          }

          for(var i in res) {
            var r = res[i]
              , position;

            position = {
              lat: r.latitude,
              lon: r.longitude
            };

            if (r.boundingbox) {
              position.boundingbox = r.boundingbox;
            }

            coordinates.push(position);
          }
        }

        callback(coordinates);
      });
  }
}



cdb.geo.geocoder.NOKIA = {

  keys: {
    app_id:   "qIWDkliFCtLntLma2e6O",
    app_code: "61YWYROufLu_f8ylE0vn0Q"
  },

  geocode: function(address, callback) {
    address = address.toLowerCase()
      .replace(/é/g,'e')
      .replace(/á/g,'a')
      .replace(/í/g,'i')
      .replace(/ó/g,'o')
      .replace(/ú/g,'u')
      .replace(/ /g,'+');

      var protocol = '';
      if(location.protocol.indexOf('http') === -1) {
        protocol = 'http:';
      }
      
      $.getJSON(protocol + '//places.nlp.nokia.com/places/v1/discover/search/?q=' + encodeURIComponent(address) + '&app_id=' + this.keys.app_id + '&app_code=' + this.keys.app_code + '&Accept-Language=en-US&at=0,0&callback=?', function(data) {

         var coordinates = [];
         if (data && data.results && data.results.items && data.results.items.length > 0) {

          var res = data.results.items;

          for(var i in res) {
            var r = res[i]
              , position;

            position = {
              lat: r.position[0],
              lon: r.position[1]
            };

            if (r.bbox) {
              position.boundingbox = {
                north: r.bbox[3],
                south: r.bbox[1],
                east: r.bbox[2],
                west: r.bbox[0] 
              }
            }

            coordinates.push(position);
          }
        }

        callback(coordinates);
      });
  }
}




/**
 * basic geometries, all of them based on geojson
 */
cdb.geo.Geometry = cdb.core.Model.extend({
  isPoint: function() {
    var type = this.get('geojson').type;
    if(type && type.toLowerCase() === 'point')
      return true;
    return false;
  }
});

cdb.geo.Geometries = Backbone.Collection.extend({});

/**
 * create a geometry
 * @param geometryModel geojson based geometry model, see cdb.geo.Geometry
 */
function GeometryView() { }

_.extend(GeometryView.prototype, Backbone.Events,{

  edit: function() {
    throw new Error("to be implemented");
  }

});
/**
* Classes to manage maps
*/

/**
* Map layer, could be tiled or whatever
*/
cdb.geo.MapLayer = cdb.core.Model.extend({

  defaults: {
    visible: true,
    type: 'Tiled'
  },
  /***
  * Compare the layer with the received one
  * @method isEqual
  * @param layer {Layer}
  */
  isEqual: function(layer) {

    var me          = this.toJSON()
      , other       = layer.toJSON()
      // Select params generated when layer is added to the map
      , map_params  = ['id', 'order'];

    // Delete from the layers copy
    _.each(map_params, function(param){
      delete me[param];
      delete other[param];
      if (me.options)     delete me.options[param];
      if (other.options)  delete other.options[param];
    });

    var myType  = me.type? me.type : me.options.type
      , itsType = other.type? other.type : other.options.type;

    if(myType && (myType === itsType)) {

      if(myType === 'Tiled') {
        var myTemplate  = me.urlTemplate? me.urlTemplate : me.options.urlTemplate
          , itsTemplate = other.urlTemplate? other.urlTemplate : other.options.urlTemplate;

        if(myTemplate === itsTemplate) {
          return true; // tiled and same template
        } else {
          return false; // tiled and differente template
        }
      } else { // same type but not tiled
        var myBaseType = me.base_type? me.base_type : me.options.base_type;
        var itsBaseType = other.base_type? other.base_type : other.options.base_type;
        if(myBaseType) {
          if(_.isEqual(me,other)) {
            return true;
          } else {
            return false;
          }
        } else { // not gmaps
          return true;
        }

      }
    }
    return false; // different type
  },

  /**
   * Updates the style chaging the table name for a new one
   * @param  {String} previousName
   * @param  {String} newName
   */
  updateCartoCss: function(previousName, newName) {
    var tileStyle = this.get('tile_style');
    var replaceRegexp = new RegExp('#'+previousName, 'g');
    tileStyle = tileStyle.replace(replaceRegexp, '#'+newName);
    this.save({'tile_style': tileStyle});
  }

});

// Good old fashioned tile layer
cdb.geo.TileLayer = cdb.geo.MapLayer.extend({
  getTileLayer: function() {
  }
});

cdb.geo.GMapsBaseLayer = cdb.geo.MapLayer.extend({
  OPTIONS: ['roadmap', 'satellite', 'terrain', 'custom'],
  defaults: {
    type: 'GMapsBase',
    base_type: 'gray_roadmap',
    style: null
  }
});

/**
 * this layer allows to put a plain color or image as layer (instead of tiles)
 */
cdb.geo.PlainLayer = cdb.geo.MapLayer.extend({
  defaults: {
    type: 'Plain',
    base_type: "plain",
    className: "plain",
    color: '#FFFFFF'
  }
});

// CartoDB layer
cdb.geo.CartoDBLayer = cdb.geo.MapLayer.extend({

  defaults: {
    attribution: '',
    type: 'CartoDB',
    active: true,
    query: null,
    opacity: 0.99,
    interactivity: null,
    interaction: true,
    debug: false,
    tiler_domain: "cartodb.com",
    tiler_port: "80",
    tiler_protocol: "http",
    sql_domain: "cartodb.com",
    sql_port: "80",
    sql_protocol: "http",
    extra_params: {},
    cdn_url: null,
    maxZoom: 28
  },

  activate: function() {
    this.set({active: true, opacity: 0.99, visible: true})
  },

  deactivate: function() {
    this.set({active: false, opacity: 0, visible: false})
  },

  /**
   * refresh the layer
   */
  invalidate: function() {
    var e = this.get('extra_params') || e;
    e.cache_buster = new Date().getTime();
    this.set('extra_params', e);
    this.trigger('change');
  },

  toggle: function() {
    if(this.get('active')) {
      this.deactivate();
    } else {
      this.activate();
    }
  }
});

cdb.geo.Layers = Backbone.Collection.extend({

  model: cdb.geo.MapLayer,

  initialize: function() {
    this.bind('add remove', this._asignIndexes, this);
  },

  clone: function() {
    var layers = new cdb.geo.Layers();
    this.each(function(layer) {
      if(layer.clone) {
        var lyr = layer.clone();
        lyr.set('id', null);
        layers.add(lyr);
      } else {
        var attrs = _.clone(layer.attributes);
        delete attrs.id;
        layers.add(attrs);
      }
    });
    return layers;
  },

  /**
   * each time a layer is added or removed
   * the index should be recalculated
   */
  _asignIndexes: function() {
    for(var i = 0; i < this.size(); ++i) {
      this.models[i].set({ order: i }, { silent: true });
    }
  }
});

/**
* map model itself
*/
cdb.geo.Map = cdb.core.Model.extend({

  defaults: {
    center: [0, 0],
    zoom: 3,
    minZoom: 0,
    maxZoom: 28,
    scrollwheel: true,
    provider: 'leaflet'
  },

  initialize: function() {
    this.layers = new cdb.geo.Layers();
    this.layers.bind('reset', function() {
      if(this.layers.size() >= 1) {
        this._adjustZoomtoLayer(this.layers.models[0]);
      }
    }, this);

    this.geometries = new cdb.geo.Geometries();
  },

  setView: function(latlng, zoom) {
    this.set({
      center: latlng,
      zoom: zoom
    }, {
      silent: true
    });
    this.trigger("set_view");
  },

  setZoom: function(z) {
    this.set({
      zoom: z
    });
  },

  enableScrollWheel: function() {
    this.set({
      scrollwheel: true
    });
  },

  disableScrollWheel: function() {
    this.set({
      scrollwheel: false
    });
  },

  getZoom: function() {
    return this.get('zoom');
  },

  setCenter: function(latlng) {
    this.set({
      center: latlng
    });
  },

  clone: function() {
    var m = new cdb.geo.Map(_.clone(this.attributes));

    // clone lists
    m.set({
      center:           _.clone(this.attributes.center),
      bounding_box_sw:  _.clone(this.attributes.bounding_box_sw),
      bounding_box_ne:  _.clone(this.attributes.bounding_box_ne),
      view_bounds_sw:   _.clone(this.attributes.view_bounds_sw),
      view_bounds_ne:   _.clone(this.attributes.view_bounds_ne)
      //attribution:      _.clone(this.attributes.attribution)
    });
    // layers
    m.layers = this.layers.clone();
    return m;

  },

  /**
  * Change multiple options at the same time
  * @params {Object} New options object
  */
  setOptions: function(options) {
    if (typeof options != "object" || options.length) {
      if (this.options.debug) {
        throw (options + ' options has to be an object');
      } else {
        return;
      }
    }

    // Set options
    _.defauls(this.options, options);

  },

  /**
  * return getViewbounds if it is set
  */
  getViewBounds: function() {
    if(this.has('view_bounds_sw') && this.has('view_bounds_ne')) {
      return [
        this.get('view_bounds_sw'),
        this.get('view_bounds_ne')
      ];
    }
    return null;
  },

  getLayerAt: function(i) {
    return this.layers.at(i);
  },

  getLayerByCid: function(cid) {
    return this.layers.getByCid(cid);
  },

  _adjustZoomtoLayer: function(layer) {
    //set zoom
    //
    /*
    var z = layer.get('maxZoom');
    if(_.isNumber(z)) {
    this.set({ maxZoom: z });
    }
    z = layer.get('minZoom');
    if(_.isNumber(z)) {
    this.set({ minZoom: z });
    }
    */
  },

  addLayer: function(layer, opts) {
    if(this.layers.size() == 0) {
      this._adjustZoomtoLayer(layer);
    }
    this.layers.add(layer, opts);
    this.trigger('layerAdded');
    if(this.layers.length === 1) {
      this.trigger('firstLayerAdded');
    }
    return layer.cid;
  },

  removeLayer: function(layer) {
    this.layers.remove(layer);
  },

  removeLayerByCid: function(cid) {
    var layer = this.layers.getByCid(cid);

    if (layer) this.removeLayer(layer);
    else cdb.log.error("There's no layer with cid = " + cid + ".");
  },

  removeLayerAt: function(i) {
    var layer = this.layers.at(i);

    if (layer) this.removeLayer(layer);
    else cdb.log.error("There's no layer in that position.");
  },

  clearLayers: function() {
    while (this.layers.length > 0) {
      this.removeLayer(this.layers.at(0));
    }
  },

  // by default the base layer is the layer at index 0
  getBaseLayer: function() {
    return this.layers.at(0);
  },

  /**
  * Checks if the base layer is already in the map as base map
  */
  isBaseLayerAdded: function(layer) {
    var baselayer = this.getBaseLayer()
    return baselayer && layer.isEqual(baselayer);
  },

  /**
  * gets the url of the template of the tile layer
  * @method getLayerTemplate
  */
  getLayerTemplate: function() {
    var baseLayer = this.getBaseLayer();
    if(baseLayer && baseLayer.get('options'))  {
      return baseLayer.get('options').urlTemplate;
    }
  },


  // remove current base layer and set the specified
  // current base layer is removed
  setBaseLayer: function(layer, opts) {
    opts = opts || {};
    var self = this;
    var old = this.layers.at(0);

    // Check if the selected base layer is already selected
    if (this.isBaseLayerAdded(layer)) {
      opts.alreadyAdded && opts.alreadyAdded();
      return false;
    }

    if (old) { // defensive programming FTW!!
      //remove layer from the view
      //change all the attributes and save it again
      //it will saved in the server and recreated in the client
      self.layers.remove(old);
      layer.set('id', old.get('id'));
      layer.set('order', old.get('order'));
      this.layers.add(layer, { at: 0 });
      layer.save(null, {
        success: function() {
          self.trigger('baseLayerAdded');
          self._adjustZoomtoLayer(layer);
          opts.success && opts.success();
        },
        error: opts.error
      })

    } else {
      self.layers.add(layer, { at: 0 });
      self.trigger('baseLayerAdded');
      self._adjustZoomtoLayer(layer);
      opts.success && opts.success();
    }

    // Update attribution removing old one and adding new one
    this.updateAttribution(old,layer);

    return layer;
  },

  updateAttribution: function(old,new_) {
    var attributions = this.get("attribution") || [];

    // Remove the old one
    if (old && old.get("attribution")) {
      attributions = _.without(attributions, old.get("attribution"));
    }

    // Save the new one
    if (new_.get("attribution")) {
      if (!_.contains(attributions, new_.get("attribution"))) {
        attributions.push(new_.get("attribution"));
      }
    }

    this.set({ attribution: attributions });
  },

  addGeometry: function(geom) {
    this.geometries.add(geom);
  },

  removeGeometry: function(geom) {
    this.geometries.remove(geom);
  },

  setBounds: function(b) {
    this.attributes.view_bounds_sw = [
      b[0][0],
      b[0][1]
    ];
    this.attributes.view_bounds_ne = [
      b[1][0],
      b[1][1]
    ];

    // change both at the same time
    this.trigger('change:view_bounds_ne', this);

  },

  // set center and zoom according to fit bounds
  fitBounds: function(bounds, mapSize) {
    var z = this.getBoundsZoom(bounds, mapSize);
    if(z == null) {
      return;
    }
    // project -> calculate center -> unproject
    var swPoint = cdb.geo.Map.latlngToMercator(bounds[0], z);
    var nePoint = cdb.geo.Map.latlngToMercator(bounds[1], z);

    var center = cdb.geo.Map.mercatorToLatLng({
      x: (swPoint[0] + nePoint[0])*0.5,
      y: (swPoint[1] + nePoint[1])*0.5
    }, z);
    this.set({
      center: center,
      zoom: z
    })
  },

  // adapted from leaflat src
  getBoundsZoom: function(boundsSWNE, mapSize) {
    var size = [mapSize.x, mapSize.y],
    zoom = this.get('minZoom') || 0,
    maxZoom = this.get('maxZoom') || 24,
    ne = boundsSWNE[1],
    sw = boundsSWNE[0],
    boundsSize = [],
    nePoint,
    swPoint,
    zoomNotFound = true;

    do {
      zoom++;
      nePoint = cdb.geo.Map.latlngToMercator(ne, zoom);
      swPoint = cdb.geo.Map.latlngToMercator(sw, zoom);
      boundsSize[0] = Math.abs(nePoint[0] - swPoint[0]);
      boundsSize[1] = Math.abs(swPoint[1] - nePoint[1]);
      zoomNotFound = boundsSize[0] <= size[0] || boundsSize[1] <= size[1];
    } while (zoomNotFound && zoom <= maxZoom);

    if (zoomNotFound) {
      return null;
    }

    return zoom - 1;

  }

}, {

  latlngToMercator: function(latlng, zoom) {
    var ll = new L.LatLng(latlng[0], latlng[1]);
    var pp = L.CRS.EPSG3857.latLngToPoint(ll, zoom);
    return [pp.x, pp.y];
  },

  mercatorToLatLng: function(point, zoom) {
    var ll = L.CRS.EPSG3857.pointToLatLng(point, zoom);
    return [ll.lat, ll.lng]
  }

});


/**
* Base view for all impl
*/
cdb.geo.MapView = cdb.core.View.extend({

  initialize: function() {

    if (this.options.map === undefined) {
      throw new Exception("you should specify a map model");
    }

    this.map = this.options.map;
    this.add_related_model(this.map);
    this.add_related_model(this.map.layers);

    this.autoSaveBounds = false;

    // this var stores views information for each model
    this.layers = {};
    this.geometries = {};

    this.bind('clean', this._removeLayers, this);
  },

  render: function() {
    return this;
  },

  /**
  * add a infowindow to the map
  */
  addInfowindow: function(infoWindowView) {
    if (infoWindowView) {
      this.$el.append(infoWindowView.render().el);
      this.addView(infoWindowView);
    }
  },

  /**
  * search in the subviews and return the infowindows
  */
  getInfoWindows: function() {
    var result = [];
    for (var s in this._subviews) {
      if(this._subviews[s] instanceof cdb.geo.ui.Infowindow) {
        result.push(this._subviews[s]);
      }
    }
    return result;
  },

  showBounds: function(bounds) {
    throw "to be implemented";
  },

  _removeLayers: function() {
    for(var layer in this.layers) {
      this.layers[layer].remove();
    }
    this.layers = {}
  },

  /**
  * set model property but unbind changes first in order to not create an infinite loop
  */
  _setModelProperty: function(prop) {
    this._unbindModel();
    this.map.set(prop);
    if(prop.center !== undefined || prop.zoom !== undefined) {
      var b = this.getBounds();
      this.map.set({
        view_bounds_sw: b[0],
        view_bounds_ne: b[1]
      });
      if(this.autoSaveBounds) {
        this._saveLocation();
      }
    }
    this._bindModel();
  },

  /** bind model properties */
  _bindModel: function() {
    this._unbindModel();
    this.map.bind('change:view_bounds_sw',  this._changeBounds, this);
    this.map.bind('change:view_bounds_ne',  this._changeBounds, this);
    this.map.bind('change:zoom',            this._setZoom, this);
    this.map.bind('change:center',          this._setCenter, this);
    this.map.bind('change:scrollwheel',     this._setScrollWheel, this);
    this.map.bind('change:attribution',     this._setAttribution, this);
  },

  /** unbind model properties */
  _unbindModel: function() {
    /*
    this.map.unbind('change:zoom',   this._setZoom, this);
    this.map.unbind('change:center', this._setCenter, this);
    this.map.unbind('change:view_bounds_sw', this._changeBounds, this);
    this.map.unbind('change:view_bounds_ne', this._changeBounds, this);
    */

    this.map.unbind('change:zoom',            null, this);
    this.map.unbind('change:center',          null, this);
    this.map.unbind('change:view_bounds_sw',  null, this);
    this.map.unbind('change:view_bounds_ne',  null, this);
    this.map.unbind('change:attribution',     null, this);
  },

  _changeBounds: function() {
    var bounds = this.map.getViewBounds();
    if(bounds) {
      this.showBounds(bounds);
    }
  },

  showBounds: function(bounds) {
    this.map.fitBounds(bounds, this.getSize())
  },

  _setAttribution: function(m,attr) {
    this.setAttribution(m);
  },

  _addLayers: function() {
    var self = this;
    this.map.layers.each(function(lyr) {
      self._addLayer(lyr);
    });
  },

  _removeLayer: function(layer) {
    var layer_view = this.layers[layer.cid];
    if(layer_view) {
      layer_view.remove();
      delete this.layers[layer.cid];
    }
  },

  _removeGeometry: function(geo) {
    var geo_view = this.geometries[geo.cid];
    delete this.layers[layer.cid];
  },

  getLayerByCid: function(cid) {
    var l = this.layers[cid];
    if(!l) {
      cdb.log.error("layer with cid " + cid + " can't be get");
    }
    return l;
  },

  _setZoom: function(model, z) {
    throw "to be implemented";
  },

  _setCenter: function(model, center) {
    throw "to be implemented";
  },

  _addLayer: function(layer, layers, opts) {
    throw "to be implemented";
  },

  _addGeomToMap: function(geom) {
    throw "to be implemented";
  },

  _removeGeomFromMap: function(geo) {
    throw "to be implemented";
  },

  setAutoSaveBounds: function() {
    var self = this;
    this.autoSaveBounds = true;
  },

  _saveLocation: _.debounce(function() {
    this.map.save(null, { silent: true });
  }, 1000),

  _addGeometry: function(geom) {
    var view = this._addGeomToMap(geom);
    this.geometries[geom.cid] = view;
  },

  _removeGeometry: function(geo) {
    var geo_view = this.geometries[geo.cid];
    this._removeGeomFromMap(geo_view);
    delete this.geometries[geo.cid];
  }


}, {

  _getClass: function(provider) {
    var mapViewClass = cdb.geo.LeafletMapView;
    if(provider === 'googlemaps') {
      if(typeof(google) != "undefined" && typeof(google.maps) != "undefined") {
        mapViewClass = cdb.geo.GoogleMapsMapView;
      } else {
        cdb.log.error("you must include google maps library _before_ include cdb");
      }
    }
    return mapViewClass;
  },

  create: function(el, mapModel) {
    var _mapViewClass = cdb.geo.MapView._getClass(mapModel.get('provider'));
    return new _mapViewClass({
      el: el,
      map: mapModel
    });
  }

}
);
/**
 * View to control the zoom of the map.
 *
 * Usage:
 *
 * var zoomControl = new cdb.geo.ui.Zoom({ model: map });
 * mapWrapper.$el.append(zoomControl.render().$el);
 *
 */


cdb.geo.ui.Zoom = cdb.core.View.extend({

  className: "cartodb-zoom",

  events: {
    'click .zoom_in': 'zoom_in',
    'click .zoom_out': 'zoom_out'
  },

  default_options: {
    timeout: 0,
    msg: ''
  },

  initialize: function() {
    this.map = this.model;

    _.defaults(this.options, this.default_options);

    this.template = this.options.template ? this.options.template : cdb.templates.getTemplate('geo/zoom');
    //TODO: bind zoom change to disable zoom+/zoom-
  },

  render: function() {
    this.$el.html(this.template(this.options));
    return this;
  },

  zoom_in: function(ev) {
    if (this.map.get("maxZoom") > this.map.getZoom()) {
      this.map.setZoom(this.map.getZoom() + 1);
    }
    ev.preventDefault();
    ev.stopPropagation();
  },

  zoom_out: function(ev) {
    if (this.map.get("minZoom") < this.map.getZoom()) {
      this.map.setZoom(this.map.getZoom() - 1);
    }
    ev.preventDefault();
    ev.stopPropagation();
  }

});
/**
 * View to know which is the map zoom.
 *
 * Usage:
 *
 * var zoomInfo = new cdb.geo.ui.ZoomInfo({ model: map });
 * mapWrapper.$el.append(zoomInfo.render().$el);
 *
 */


cdb.geo.ui.ZoomInfo = cdb.core.View.extend({

  className: "cartodb-zoom-info",

  initialize: function() {
    this.model.bind("change:zoom", this.render, this);
  },

  render: function() {
    this.$el.html(this.model.get("zoom"));
    return this;
  }
});
cdb.geo.ui.LegendItemModel = cdb.core.Model.extend({ });

cdb.geo.ui.LegendItems = Backbone.Collection.extend({
  model: cdb.geo.ui.LegendItemModel
});

cdb.geo.ui.LegendItem = cdb.core.View.extend({

  tagName: "li",

  initialize: function() {

    _.bindAll(this, "render");
    this.template = cdb.templates.getTemplate('templates/map/legend/item');

  },

  render: function() {

    this.$el.html(this.template(this.model.toJSON()));
    return this.$el;

  }

});

cdb.geo.ui.Legend = cdb.core.View.extend({

  id: "legend",

  default_options: {

  },

  initialize: function() {

    this.map = this.model;

    this.add_related_model(this.model);

    _.bindAll(this, "render", "show", "hide");

    _.defaults(this.options, this.default_options);

    if (this.collection) {
      this.model.collection = this.collection;
    }

    this.template = this.options.template ? this.options.template : cdb.templates.getTemplate('geo/legend');
  },

  show: function() {
    this.$el.fadeIn(250);
  },

  hide: function() {
    this.$el.fadeOut(250);
  },

  render: function() {
    var self = this;

    if (this.model != undefined) {
      this.$el.html(this.template(this.model.toJSON()));
    }

    if (this.collection) {

      this.collection.each(function(item) {

        var view = new cdb.geo.ui.LegendItem({ className: item.get("className"), model: item });
        self.$el.find("ul").append(view.render());

      });
    }

    return this;
  }

});
cdb.geo.ui.SwitcherItemModel = Backbone.Model.extend({ });

cdb.geo.ui.SwitcherItems = Backbone.Collection.extend({
  model: cdb.geo.ui.SwitcherItemModel
});

cdb.geo.ui.SwitcherItem = cdb.core.View.extend({

  tagName: "li",

  events: {

    "click a" : "select"

  },

  initialize: function() {

    _.bindAll(this, "render");
    this.template = cdb.templates.getTemplate('templates/map/switcher/item');
    this.parent = this.options.parent;
    this.model.on("change:selected", this.render);

  },

  select: function(e) {
    e.preventDefault();
    this.parent.toggle(this);
    var callback = this.model.get("callback");

    if (callback) {
      callback();
    }

  },

  render: function() {

    if (this.model.get("selected") == true) {
      this.$el.addClass("selected");
    } else {
      this.$el.removeClass("selected");
    }

    this.$el.html(this.template(this.model.toJSON()));
    return this.$el;

  }

});

cdb.geo.ui.Switcher = cdb.core.View.extend({

  id: "switcher",

  default_options: {

  },

  initialize: function() {

    this.map = this.model;

    this.add_related_model(this.model);

    _.bindAll(this, "render", "show", "hide", "toggle");

    _.defaults(this.options, this.default_options);

    if (this.collection) {
      this.model.collection = this.collection;
    }

    this.template = this.options.template ? this.options.template : cdb.templates.getTemplate('geo/switcher');
  },

  show: function() {
    this.$el.fadeIn(250);
  },

  hide: function() {
    this.$el.fadeOut(250);
  },

  toggle: function(clickedItem) {

    if (this.collection) {
      this.collection.each(function(item) {
        item.set("selected", !item.get("selected"));
      });
    }

  },

  render: function() {
    var self = this;

    if (this.model != undefined) {
      this.$el.html(this.template(this.model.toJSON()));
    }

    if (this.collection) {

      this.collection.each(function(item) {

        var view = new cdb.geo.ui.SwitcherItem({ parent: self, className: item.get("className"), model: item });
        self.$el.find("ul").append(view.render());

      });
    }

    return this;
  }

});
/** Usage:
*
* Add Infowindow model:
*
* var infowindowModel = new cdb.geo.ui.InfowindowModel({
*   template_name: 'templates/map/infowindow',
*   latlng: [72, -45],
*   offset: [100, 10]
* });
*
* var infowindow = new cdb.geo.ui.Infowindow({
*   model: infowindowModel,
*   mapView: mapView
* });
*
* Show the infowindow:
* infowindow.showInfowindow();
*
*/

cdb.geo.ui.InfowindowModel = Backbone.Model.extend({
  SYSTEM_COLUMNS: ['the_geom', 'the_geom_webmercator', 'created_at', 'updated_at', 'cartodb_id', 'cartodb_georef_status'],

  defaults: {
    template_name: 'geo/infowindow',
    latlng: [0, 0],
    offset: [28, 0], // offset of the tip calculated from the bottom left corner
    autoPan: true,
    content: "",
    visibility: false,
    fields: null // contains the fields displayed in the infowindow
  },

  clearFields: function() {
    this.set({fields: []});
  },

  saveFields: function() {
    this.set('old_fields', _.clone(this.get('fields')));
  },

  fieldCount: function() {
    return this.get('fields').length
  },

  restoreFields: function(whiteList) {
     var fields = this.get('old_fields')
     if(whiteList) {
       fields = fields.filter(function(f) {
          return _.contains(whiteList, f.name);
       });
     }
     if(fields && fields.length) {
       this._setFields(fields);
     }
     this.unset('old_fields');
  },

  _cloneFields: function() {
    return _(this.get('fields')).map(function(v) {
      return _.clone(v);
    });
  },

  _setFields: function(f) {
    f.sort(function(a, b) { return a.position -  b.position; });
    this.set({'fields': f});
  },

  sortFields: function() {
    this.get('fields').sort(function(a, b) { return a.position - b.position; });
  },

  _addField: function(fieldName, at) {
    var dfd = $.Deferred();
    if(!this.containsField(fieldName)) {
      var fields = this.get('fields');
      if(fields) {
        at = at === undefined ? fields.length: at;
        fields.push({name: fieldName, title: true, position: at});
      } else {
        at = at === undefined ? 0 : at;
        this.set('fields', [{name: fieldName, title: true, position: at}])
      }
    }
    dfd.resolve();
    return dfd.promise();
  },

  addField: function(fieldName, at) {
    var self = this;
    $.when(this._addField(fieldName, at)).then(function() {
      self.sortFields();
      self.trigger('change:fields');
      self.trigger('add:fields');
    });
    return this;
  },

  getFieldProperty: function(fieldName, k) {
    if(this.containsField(fieldName)) {
      var fields = this.get('fields') || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      return fields[idx][k];
    }
    return null;
  },

  setFieldProperty: function(fieldName, k, v) {
    if(this.containsField(fieldName)) {
      var fields = this._cloneFields() || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      fields[idx][k] = v;
      this._setFields(fields);
    }
    return this;
  },

  getFieldPos: function(fieldName) {
    var p = this.getFieldProperty(fieldName, 'position');
    if(p == undefined) {
      return Number.MAX_VALUE;
    }
    return p;
  },

  containsField: function(fieldName) {
    var fields = this.get('fields') || [];
    return _.contains(_(fields).pluck('name'), fieldName);
  },

  removeField: function(fieldName) {
    if(this.containsField(fieldName)) {
      var fields = this._cloneFields() || [];
      var idx = _.indexOf(_(fields).pluck('name'), fieldName);
      if(idx >= 0) {
        fields.splice(idx, 1);
      }
      this._setFields(fields);
      this.trigger('remove:fields')
    }
    return this;
  }

});

cdb.geo.ui.Infowindow = cdb.core.View.extend({
  className: "cartodb-infowindow",

  spin_options: {
    lines: 10, length: 0, width: 4, radius: 6, corners: 1, rotate: 0, color: 'rgba(0,0,0,0.5)',
    speed: 1, trail: 60, shadow: false, hwaccel: true, className: 'spinner', zIndex: 2e9,
    top: 'auto', left: 'auto', position: 'absolute'
  },

  events: {
    // Close bindings
    "click .close":         "_closeInfowindow",
    "touchstart .close":    "_closeInfowindow",
    "MSPointerDown .close": "_closeInfowindow",
    // Rest infowindow bindings
    "dragstart":            "_checkOrigin",
    "mousedown":            "_checkOrigin",
    "touchstart":           "_checkOrigin",
    "MSPointerDown":        "_checkOrigin",
    "dblclick":             "_stopPropagation",
    "mousewheel":           "_stopPropagation",
    "DOMMouseScroll":       "_stopPropagation",
    "dbclick":              "_stopPropagation",
    "click":                "_stopPropagation"
  },

  initialize: function(){
    var self = this;

    _.bindAll(this, "render", "setLatLng", "changeTemplate", "_updatePosition", "_update", "toggle", "show", "hide");

    this.mapView = this.options.mapView;

    this.template = this.options.template ? this.options.template : cdb.templates.getTemplate(this.model.get("template_name"));

    this.add_related_model(this.model);

    this.model.bind('change:content',       this.render, this);
    this.model.bind('change:template_name', this.changeTemplate, this);
    this.model.bind('change:latlng',        this._update, this);
    this.model.bind('change:visibility',    this.toggle, this);
    this.model.bind('change:template',      this._compileTemplate, this);

    this.mapView.map.bind('change',         this._updatePosition, this);

    this.mapView.bind('zoomstart', function(){
      self.hide(true);
    });

    this.mapView.bind('zoomend', function() {
      self.show(true);
    });

    // Set min height to show the scroll
    this.minHeightToScroll = 180;

    this.render();
    this.$el.hide();
  },

  /**
   *  Render infowindow content
   */
  render: function() {
    if(this.template) {

      // If there is content, destroy the jscrollpane first, then remove the content.
      var $jscrollpane = this.$el.find(".cartodb-popup-content");
      if ($jscrollpane.length > 0 && $jscrollpane.data() != null) {
        $jscrollpane.data().jsp && $jscrollpane.data().jsp.destroy();
      }

      var attrs = _.clone(this.model.attributes);

      // Mustache doesn't support 0 values, we have to convert number to strings
      // before apply the template

      var fields = this._fieldsToString(attrs);

      this.$el.html($(this.template(fields)));

      // Hello jscrollpane hacks!
      // It needs some time to initialize, if not it doesn't render properly the fields
      // Check the height of the content + the header if exists
      var self = this;
      setTimeout(function() {
        var actual_height = self.$el.find(".cartodb-popup-content").outerHeight() + self.$el.find(".cartodb-popup-header").outerHeight();
        if (self.minHeightToScroll <= actual_height)
          self.$el.find(".cartodb-popup-content").jScrollPane({
            maintainPosition:       false,
            verticalDragMinHeight:  20
          });
      }, 1);

      // If the infowindow is loading, show spin
      this._checkLoading();

      // If the template is 'cover-enabled', load the cover
      this._loadCover();
    };

    return this;
  },

  /**
   *  Change template of the infowindow
   */
  changeTemplate: function(template_name) {
    this.template = cdb.templates.getTemplate(this.model.get("template_name"));
    this.render();
  },

  /**
   *  Compile template of the infowindow
   */
  _compileTemplate: function() {
    this.template = new cdb.core.Template({
       template: this.model.get('template'),
       type: this.model.get('template_type') || 'mustache'
    }).asFunction()

    this.render();
  },

  /**
   *  Check event origin
   */
  _checkOrigin: function(ev) {
    // If the mouse down come from jspVerticalBar
    // dont stop the propagation, but if the event
    // is a touchstart, stop the propagation
    var come_from_scroll = (($(ev.target).closest(".jspVerticalBar").length > 0) && (ev.type != "touchstart"));

    if (!come_from_scroll) {
      ev.stopPropagation();
    }
  },

  /**
   *  Convert values to string unless value is NULL
   */
  _fieldsToString: function(attrs) {
    if (attrs.content && attrs.content.fields) {
      var self = this;
      attrs.content.fields = _.map(attrs.content.fields, function(attr,i) {
        // Return whole attribute sanitized
        return self._sanitizeField(attr, attrs.template_name, attr.index || i);
      });
    }

    return attrs;
  },

  /**
   *  Sanitize fields, what does it mean?
   *  - If value is null, transform to string
   *  - If value is an url, add it as an attribute
   *  - Cut off title if it is very long (in header or image templates).
   *  - If the value is a valid url, let's make it a link.
   *  - More to come...
   */                                                                                                                
  _sanitizeField: function(attr, template_name, pos) {
    // Check null or undefined :| and set both to empty == ''
    if (attr.value == null || attr.value == undefined) {
      attr.value = '';
    }

    // Cast all values to string due to problems with Mustache 0 number rendering
    var new_value = attr.value.toString();

    //Link? go ahead!
    if (!attr.type && this._isValidURL(new_value)) {
      attr.url = attr.value;
    }

    // If it is index 0, not any field type, header template type and length bigger than 30... cut off the text!
    if (!attr.type && pos==0 && attr.value.length > 35 && template_name && template_name.search('_header_') != -1) {
      new_value = attr.value.substr(0,32) + "...";
    }

    // If it is index 0, not any field type, header image template type... don't cut off the text!
    if (pos==0 && template_name.search('_header_with_image') != -1) {
      new_value = attr.value;
    }

    // If it is index 1, not any field type, header image template type and length bigger than 30... cut off the text!
    if (!attr.type && pos==1 && attr.value.length > 35 && template_name && template_name.search('_header_with_image') != -1) {
      new_value = attr.value.substr(0,32) + "...";
    }

    attr.value = new_value;

    return attr;
  },

  /**
   *  Check if infowindow is loading the row content
   */
  _checkLoading: function() {
    var content = this.model.get("content");

    if (content.fields && content.fields.length == 1 && content.fields[0].type == "loading") {
      this._startSpinner()
    } else {
      this._stopSpinner()
    }
  },

  /**
   *  Stop loading spinner
   */
  _stopSpinner: function() {
    if (this.spinner)
      this.spinner.stop()
  },

  /**
   *  Start loading spinner
   */
  _startSpinner: function($el) {
    this._stopSpinner();

    var $el = this.$el.find('.loading');

    if ($el) {
      // Check if it is dark or other to change color
      var template_dark = this.model.get('template_name').search('dark') != -1;

      if (template_dark) {
        this.spin_options.color = '#FFF';
      } else {
        this.spin_options.color = 'rgba(0,0,0,0.5)';
      }

      this.spinner = new Spinner(this.spin_options).spin();
      $el.append(this.spinner.el);
    }
  },

  /**
   *  Stop loading spinner
   */
  _containsCover: function() {
    return this.$el.find(".cartodb-popup.header").attr("data-cover") ? true : false;
  },


  /**
   *  Get cover URL
   */
  _getCoverURL: function() {

    var content = this.model.get("content");

    if (content && content.fields) {

      if (content.fields && content.fields.length > 0) {
        // Force always the value to be a string
        return (content.fields[0].value).toString();
      }
      return false;
    }

    return false;
  },

  /**
   *  Attempts to load the cover URL and show it
   */
  _loadCover: function() {

    if (!this._containsCover()) return;

    var
    self = this,
    $cover = this.$(".cover"),
    $shadow = this.$(".shadow"),
    url = this._getCoverURL();

    if (!this._isValidURL(url)) {
      $shadow.hide();
      cdb.log.info("Header image url not valid");
      return;
    }

    // configure spinner
    var
    target  = document.getElementById('spinner'),
    opts    = { lines: 9, length: 4, width: 2, radius: 4, corners: 1, rotate: 0, color: '#ccc', speed: 1, trail: 60, shadow: true, hwaccel: false, zIndex: 2e9 },
    spinner = new Spinner(opts).spin(target);

    // create the image
    var $img = $cover.find("img");

    $img.hide(function() {
      this.remove();
    });

    $img = $("<img />").attr("src", url);
    $cover.append($img);

    $img.load(function(){
      spinner.stop();

      var w  = $img.width();
      var h  = $img.height();
      var coverWidth = $cover.width();
      var coverHeight = $cover.height();

      var ratio = h / w;
      var coverRatio = coverHeight / coverWidth;

      // Resize rules
      if ( w > coverWidth && h > coverHeight) { // bigger image
        if ( ratio < coverRatio ) $img.css({ height: coverHeight });
        else {
          var calculatedHeight = h / (w / coverWidth);
          $img.css({ width: coverWidth, top: "50%", position: "absolute", "margin-top": -1*parseInt(calculatedHeight, 10)/2 });
        }
      } else {
        var calculatedHeight = h / (w / coverWidth);
        $img.css({ width: coverWidth, top: "50%", position: "absolute", "margin-top": -1*parseInt(calculatedHeight, 10)/2 });
      }

      $img.fadeIn(300);
    })
    .error(function(){
      spinner.stop();
    });
  },

  /**
   *  Return true if the provided URL is valid
   */
  _isValidURL: function(url) {
    if (url) {
      var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/
      return url.match(urlPattern) != null ? true : false;
    }

    return false;
  },

  /**
   *  Toggle infowindow visibility
   */
  toggle: function() {
    this.model.get("visibility") ? this.show() : this.hide();
  },

  /**
   *  Stop event propagation
   */
  _stopPropagation: function(ev) {
    ev.stopPropagation();
  },

  /**
   *  Set loading state adding its content
   */
  setLoading: function() {
    this.model.set({
      content:  {
        fields: [{
          title: null,
          value: 'Loading content...',
          index: null,
          type: "loading"
        }],
        data: {}
      }
    })
    return this;
  },

  /**
   *  Set loading state adding its content
   */
  setError: function() {
    this.model.set({
      content:  {
        fields: [{
          title: null,
          value: 'There has been an error...',
          index: null,
          type: 'error'
        }],
        data: {}
      }
    })
    return this;
  },

  /**
   * Set the correct position for the popup
   */
  setLatLng: function (latlng) {
    this.model.set("latlng", latlng);
    return this;
  },

  /**
   *  Close infowindow
   */
  _closeInfowindow: function(ev) {
    if (ev) {
      ev.preventDefault()
      ev.stopPropagation();
    }

    this.model.set("visibility",false);
  },

  /**
   *  Set visibility infowindow
   */
  showInfowindow: function() {
    this.model.set("visibility", true);
  },

  /**
   *  Show infowindow (update, pan, etc)
   */
  show: function (no_pan) {
    var self = this;

    if (this.model.get("visibility")) {
      self.$el.css({ left: -5000 });
      self._update(no_pan);
    }
  },

  /**
   *  Get infowindow visibility
   */
  isHidden: function () {
    return !this.model.get("visibility");
  },

  /**
   *  Set infowindow to hidden
   */
  hide: function (force) {
    if (force || !this.model.get("visibility")) this._animateOut();
  },

  /**
   *  Update infowindow
   */
  _update: function (no_pan) {

    if(!this.isHidden()) {
      var delay = 0;

      if (!no_pan) {
        var delay = this.adjustPan();
      }

      this._updatePosition();
      this._animateIn(delay);
    }
  },

  /**
   *  Animate infowindow to show up
   */
  _animateIn: function(delay) {
    if (!$.browser.msie || ($.browser.msie && $.browser.version.search("9.") != -1)) {
      this.$el.css({
        'marginBottom':'-10px',
        'display':'block',
        opacity:0
      });

      this.$el
      .delay(delay)
      .animate({
        opacity: 1,
        marginBottom: 0
      },300);
    } else {
      this.$el.show();
    }
  },

  /**
   *  Animate infowindow to disappear
   */
  _animateOut: function() {
    if (!$.browser.msie || ($.browser.msie && $.browser.version.search("9.") != -1)) {
      var self = this;
      this.$el.animate({
        marginBottom: "-10px",
        opacity:      "0",
        display:      "block"
      }, 180, function() {
        self.$el.css({display: "none"});
      });
    } else {
      this.$el.hide();
    }
  },

  /**
   *  Update the position (private)
   */
  _updatePosition: function () {
    if(this.isHidden()) return;

    var
    offset          = this.model.get("offset")
    pos             = this.mapView.latLonToPixel(this.model.get("latlng")),
    x               = this.$el.position().left,
    y               = this.$el.position().top,
    containerHeight = this.$el.outerHeight(true),
    containerWidth  = this.$el.width(),
    left            = pos.x - offset[0],
    size            = this.mapView.getSize(),
    bottom          = -1*(pos.y - offset[1] - size.y);

    this.$el.css({ bottom: bottom, left: left });
  },

  /**
   *  Adjust pan to show correctly the infowindow
   */
  adjustPan: function (callback) {
    var offset = this.model.get("offset");

    if (!this.model.get("autoPan") || this.isHidden()) { return; }

    var
    x               = this.$el.position().left,
    y               = this.$el.position().top,
    containerHeight = this.$el.outerHeight(true) + 15, // Adding some more space
    containerWidth  = this.$el.width(),
    pos             = this.mapView.latLonToPixel(this.model.get("latlng")),
    adjustOffset    = {x: 0, y: 0};
    size            = this.mapView.getSize()
    wait_callback   = 0;

    if (pos.x - offset[0] < 0) {
      adjustOffset.x = pos.x - offset[0] - 10;
    }

    if (pos.x - offset[0] + containerWidth > size.x) {
      adjustOffset.x = pos.x + containerWidth - size.x - offset[0] + 10;
    }

    if (pos.y - containerHeight < 0) {
      adjustOffset.y = pos.y - containerHeight - 10;
    }

    if (pos.y - containerHeight > size.y) {
      adjustOffset.y = pos.y + containerHeight - size.y;
    }

    if (adjustOffset.x || adjustOffset.y) {
      this.mapView.panBy(adjustOffset);
      wait_callback = 300;
    }

    return wait_callback;
  }

});

cdb.geo.ui.Header = cdb.core.View.extend({

  className: 'cartodb-header',

  initialize: function() {},

  render: function() {
    this.$el.html(this.options.template(this.options));
    return this;
  }
});

cdb.geo.ui.Search = cdb.core.View.extend({

  className: 'cartodb-searchbox',

  events: {
    "click input[type='text']":   '_focus',
    "submit form":                '_submit',
    "click":                      '_stopPropagation',
    "dblclick":                   '_stopPropagation',
    "mousedown":                  '_stopPropagation'
  },

  initialize: function() {},

  render: function() {
    this.$el.html(this.options.template(this.options));
    return this;
  },

  _stopPropagation: function(ev) {
    ev.stopPropagation();
  },

  _focus: function(ev) {
    ev.preventDefault();

    $(ev.target).focus();
  },

  _showLoader: function() {
    this.$('span.loader').show();
  },

  _hideLoader: function() {
    this.$('span.loader').hide();
  },

  _submit: function(ev) {
    ev.preventDefault();

    var self = this
      , address = this.$('input.text').val();

    // Show geocoder loader
    this._showLoader();
     
    cdb.geo.geocoder.NOKIA.geocode(address, function(coords) {
      if (coords.length>0) {
        var validBBox = true;
        
        // check bounding box is valid
        if(!coords[0].boundingbox || coords[0].boundingbox.south == coords[0].boundingbox.north ||
          coords[0].boundingbox.east == coords[0].boundingbox.west) {
          validBBox = false;
        }

        if (validBBox && coords[0].boundingbox) {
          self.model.setBounds([
            [
              parseFloat(coords[0].boundingbox.south),
              parseFloat(coords[0].boundingbox.west)
            ],
            [
              parseFloat(coords[0].boundingbox.north),
              parseFloat(coords[0].boundingbox.east)
            ]
          ]);
        } else if (coords[0].lat && coords[0].lon) {
          self.model.setCenter([coords[0].lat, coords[0].lon]);
          self.model.setZoom(10);
        }
      }

      // Hide geocoder loader
      self._hideLoader();
    });
  }
});
/**
 * Show or hide tiles loader
 *
 * Usage:
 *
 * var tiles_loader = new cdb.geo.ui.TilesLoader();
 * mapWrapper.$el.append(tiles_loader.render().$el);
 *
 */


cdb.geo.ui.TilesLoader = cdb.core.View.extend({

  className: "cartodb-tiles-loader",

  default_options: {
    animationSpeed: 500
  },

  initialize: function() {
    _.defaults(this.options, this.default_options);
    this.isVisible = false;
    this.template = this.options.template ? this.options.template : cdb.templates.getTemplate('geo/tiles_loader');
  },

  render: function() {
    this.$el.html($(this.template(this.options)));
    return this;
  },

  show: function(ev) {
    this.isVisible = true;
    if (!$.browser.msie || ($.browser.msie && $.browser.version.indexOf("9.") != 0)) {
      this.$el.fadeTo(this.options.animationSpeed, 1)
    } else {
      this.$el.show();
    }
  },

  hide: function(ev) {
    this.isVisible = false;
    if (!$.browser.msie || ($.browser.msie && $.browser.version.indexOf("9.") == 0)) {
      this.$el.stop(true).fadeTo(this.options.animationSpeed, 0)
    } else {
      this.$el.hide();
    }
  }

});

cdb.geo.ui.InfoBox = cdb.core.View.extend({

  className: 'cartodb-infobox',
  defaults: {
    pos_margin: 20,
    position: 'bottom|right',
    width: 200
  },

  initialize: function() {
    var self = this;
    _.defaults(this.options, this.defaults);
    if(this.options.layer) {
      this.enable();
    }
    this.template = cdb.core.Template.compile(this.options.template || this.defaultTemplate, 'mustache');
  },

  enable: function() {
    if(this.options.layer) {
      this.options.layer
        .on('featureOver', function(e, latlng, pos, data) {
          this.render(data).show();
        }, this)
        .on('featureOut', function() {
          this.hide();
        }, this);
    }
  },

  disable: function() {
    if(this.options.layer) {
      this.options.layer.off(null, null, this);
    }
  },

  // set position based on a string like "top|right", "top|left", "bottom|righ"...
  setPosition: function(pos) {
    var props = {};
    if(pos.indexOf('top') !== -1) {
      props.top = this.options.pos_margin;
    } else if(pos.indexOf('bottom') !== -1) {
      props.bottom = this.options.pos_margin;
    }

    if(pos.indexOf('left') !== -1) {
      props.left = this.options.pos_margin;
    } else if(pos.indexOf('right') !== -1) {
      props.right = this.options.pos_margin;
    }
    this.$el.css(props);

  },

  render: function(data) {
    this.$el.html( this.template(data) );
    if(this.options.width) {
      this.$el.css('width', this.options.width);
    }
    if(this.options.position) {
      this.setPosition(this.options.position);
    }
    return this;
  }

});


cdb.geo.ui.Tooltip = cdb.geo.ui.InfoBox.extend({

  DEFAULT_OFFSET_TOP: 30,
  defaultTemplate: '<p>{{text}}</p>',
  className: 'cartodb-tooltip',

  initialize: function() {
    this.options.template = this.options.template || defaultTemplate;
    this.options.position = 'none';
    this.options.width = null;
    cdb.geo.ui.InfoBox.prototype.initialize.call(this);
  },

  enable: function() {
    if(this.options.layer) {
      this.options.layer
        .on('featureOver', function(e, latlng, pos, data) {
          this.show(pos, data);
        }, this)
        .on('featureOut', function() {
          this.hide();
        }, this);
    }
  },

  show: function(pos, data) {
    this.render(data);
    this.elder('show');
    this.$el.css({
      'left': (pos.x - this.$el.width()/2),
      'top': (pos.y - (this.options.offset_top || this.DEFAULT_OFFSET_TOP))
    });
  },

  render: function(data) {
    this.$el.html( this.template(data) );
  }

});


/*
 *  common functions for cartodb connector
 */

function CartoDBLayerCommon() {}

CartoDBLayerCommon.prototype = {

  // the way to show/hidelayer is to set opacity
  // removing the interactivty at the same time
  show: function() {
    if (this.options.visible) {
      return;
    }
    this.options.visible = true;
    this.setOpacity(this.options.previous_opacity);
    delete this.options.previous_opacity;
    this.setInteraction(true);
  },

  hide: function() {
    if (!this.options.visible) {
      return;
    }
    this.options.previous_opacity = this.options.opacity;
    this.setOpacity(0);
    this.setInteraction(false);

    this.options.visible = false;
  },


  /**
   * Check if CartoDB logo already exists
   */
  _isWadusAdded: function(container, className) {
    // Check if any cartodb-logo exists within container
    var a = [];
    var re = new RegExp('\\b' + className + '\\b');
    var els = container.getElementsByTagName("*");
    for(var i=0,j=els.length; i<j; i++)
      if(re.test(els[i].className))a.push(els[i]);

    return a.length > 0;
  },

  
  /**
   *  Check if browser supports retina images
   */
  _isRetinaBrowser: function() {
    return  ('devicePixelRatio' in window && window.devicePixelRatio > 1) ||
            ('matchMedia' in window && window.matchMedia('(min-resolution:144dpi)') &&
            window.matchMedia('(min-resolution:144dpi)').matches);
  },


  /**
   * Add Cartodb logo
   * It needs a position, timeout if it is needed and the container where add it
   */
  _addWadus: function(position, timeout, container) {
    if (this.options.cartodb_logo !== false && !this._isWadusAdded(container, 'cartodb-logo')) {
      var cartodb_link = document.createElement("div");
      var is_retina = this._isRetinaBrowser();
      cartodb_link.setAttribute('class','cartodb-logo');
      setTimeout(function() {
        cartodb_link.setAttribute('style',"position:absolute; bottom:0; left:0; display:block; border:none; z-index:1000000;");
        var protocol = location.protocol.indexOf('https') === -1 ? 'http': 'https';
        cartodb_link.innerHTML = "<a href='http://www.cartodb.com' target='_blank'><img width='71' height='29' src='" + protocol + "://cartodb.s3.amazonaws.com/static/new_logo" + (is_retina ? '@2x' : '') + ".png' style='position:absolute; bottom:" + 
          ( position.bottom || 0 ) + "px; left:" + ( position.left || 0 ) + "px; display:block; width:71px!important; height:29px!important; border:none; outline:none;' alt='CartoDB' title='CartoDB' />";
        container.appendChild(cartodb_link);
      },( timeout || 0 ));
    }
  },


  _host: function(subhost) {
    var opts = this.options;
    if (opts.no_cdn) {
      return opts.tiler_protocol +
         "://" + ((opts.user_name) ? opts.user_name+".":"")  +
         opts.tiler_domain +
         ((opts.tiler_port != "") ? (":" + opts.tiler_port) : "");
    } else {
      var h = opts.tiler_protocol + "://";
      if (subhost) {
        h += subhost + ".";
      }
      h += cdb.CDB_HOST[opts.tiler_protocol] + "/" + opts.user_name;
      return h;
    }
  },

  //
  // param ext tile extension, i.e png, json
  // 
  _tilesUrl: function(ext, subdomain) {
    var opts = this.options;
    ext = ext || 'png';
    var cartodb_url = this._host(subdomain) + '/tiles/' + opts.table_name + '/{z}/{x}/{y}.' + ext + '?';

    // set params
    var params = {};
    if(opts.query) {
      params.sql = opts.query;
    }

    if(opts.query_wrapper) {
      params.sql = _.template(opts.query_wrapper)({ sql: params.sql || "select * from " + opts.table_name });
    }

    if(opts.tile_style && !opts.use_server_style) {
      params.style = opts.tile_style;
    }
    // style_version is only valid when tile_style is present
    if(opts.tile_style && opts.style_version && !opts.use_server_style) {
      params.style_version = opts.style_version;
    }

    if(ext === 'grid.json') {
      if(opts.interactivity) {
        params.interactivity = opts.interactivity.replace(/ /g, '');
      }
    }

    // extra_params?
    for (_param in opts.extra_params) {
       params[_param] = opts.extra_params[_param];
    }

    var url_params = [];
    for(var k in params) {
      var p = params[k];
      if(p) {
        var q = encodeURIComponent(
          p.replace ? 
            p.replace(/\{\{table_name\}\}/g, opts.table_name):
            p
        );
        q = q.replace(/%7Bx%7D/g,"{x}").replace(/%7By%7D/g,"{y}").replace(/%7Bz%7D/g,"{z}");
        url_params.push(k + "=" + q);
      }
    }
    cartodb_url += url_params.join('&');

    return cartodb_url;
  },

  isHttps: function() {
    return this.options.tiler_protocol === 'https';
  },

  _tileJSON: function () {
    var grids = [];
    var tiles = [];
    var subdomains = this.options.subdomains || ['0', '1', '2', '3'];
    if(this.isHttps()) {
      subdomains = [null]; // no subdomain
    } 

    // use subdomains
    for(var i = 0; i < subdomains.length; ++i) {
      var s = subdomains[i]
      grids.push(this._tilesUrl('grid.json', s));
      tiles.push(this._tilesUrl('png', s));
    }
    return {
        tilejson: '2.0.0',
        scheme: 'xyz',
        grids: grids,
        tiles: tiles,
        formatter: function(options, data) { return data; }
    };
  },

  error: function(e) {
    console.log(e.error);
  },

  tilesOk: function() {
  },

  /**
   *  Check the tiles
   */
  _checkTiles: function() {
    var xyz = {z: 4, x: 6, y: 6}
      , self = this
      , img = new Image()
      , urls = this._tileJSON()

    var grid_url = urls.tiles[0].replace(/\{z\}/g,xyz.z).replace(/\{x\}/g,xyz.x).replace(/\{y\}/g,xyz.y);


    $.ajax({
      method: "get",
      url: grid_url,
      crossDomain: true,
      success: function() {
        self.tilesOk();
        clearTimeout(timeout)
      },
      error: function(xhr, msg, data) {
        clearTimeout(timeout);
        self.error(xhr.responseText && JSON.parse(xhr.responseText));
      }
    });

    // Hacky for reqwest, due to timeout doesn't work very well
    var timeout = setTimeout(function(){
      clearTimeout(timeout);
      self.error("tile timeout");
    }, 30000);

  }

};

(function() {
/**
 * this module implements all the features related to overlay geometries
 * in leaflet: markers, polygons, lines and so on
 */

// layer to geojson from https://raw.github.com/ebrehault/Leaflet/681d26aa0d301cb2ab5f0963eb1ea8fff14aa02c/src/layer/GeoJSON.js
// wait until leaflet includes it in the core
// see https://github.com/CloudMade/Leaflet/issues/712
L.Util.extend(L.GeoJSON, {
  toGeoJSON: function(target) {
    if (target instanceof L.Marker) {
        //Point
        return {
            coordinates: this.latLngToCoords(target.getLatLng()),
            type: 'Point'
        }
    } else if (target instanceof L.MultiPolygon || target instanceof L.MultiPolyline) {
        //MultiPolygon and MultiLineString
        var multi = [];
        var layers = target._layers;
        for (var stamp in layers) {
            multi.push(this.toGeoJSON(layers[stamp]).coordinates);
        }
        return {
            coordinates: multi,
            type: (target instanceof L.MultiPolygon) ? 'MultiPolygon': 'MultiLineString'
        };
    } else if (target instanceof L.Polygon) {
        //Polygon
        var coords = this.latLngsToCoords(target.getLatLngs());
        return {
            coordinates: [coords],
            type: 'Polygon'
        };
    } else if (target instanceof L.Polyline) {
        //Linestring
        var coords = this.latLngsToCoords(target.getLatLngs());
        return {
            coordinates: coords,
            type: 'LineString'
        };
    } else if (target instanceof L.FeatureGroup) {
        //Multi point and GeometryCollection
        var multi = [];
        var layers = target._layers;
        var points = true;
        for (var stamp in layers) {
            var json = this.toGeoJSON(layers[stamp]);
            multi.push(json);
            if (json.type !== 'Point') {
                points = false;
            }
        }
        if (points) {
            var coords = multi.map(function(geo){
                return geo.coordinates;
            });
            return {
                coordinates: coords,
                type: 'MultiPoint'
            };
        } else {
            return {
                geometries: multi,
                type: 'GeometryCollection'
            };
        }
    }
  },

  latLngToCoords: function(latlng) {
      return [latlng.lng, latlng.lat];
  },

  latLngsToCoords: function(arrLatlng) {
      var coords = [];
      arrLatlng.forEach(function(latlng) {
          coords.push(this.latLngToCoords(latlng));
      },
      this);
      return coords;
  }
});




/**
 * view for markers
 */
function PointView(geometryModel) {
  var self = this;
  // events to link
  var events = [
    'click',
    'dblclick',
    'mousedown',
    'mouseover',
    'mouseout',
    'dragstart',
    'drag',
    'dragend'
  ];

  this._eventHandlers = {};
  this.model = geometryModel;
  this.points = [];

  this.geom = L.GeoJSON.geometryToLayer(geometryModel.get('geojson'), function(geojson, latLng) {
      //TODO: create marker depending on the visualizacion options
      var p = L.marker(latLng,{
        icon: L.icon({
          iconUrl: '/assets/icons/default_marker.png',
          iconAnchor: [11, 11]
        })
      });

      var i;
      for(i = 0; i < events.length; ++i) {
        var e = events[i];
        p.on(e, self._eventHandler(e));
      }
      return p;
  });

  this.bind('dragend', function(e, pos) { 
    geometryModel.set({
      geojson: {
        type: 'Point',
        //geojson is lng,lat
        coordinates: [pos[1], pos[0]]
      }
    });
  });
}

PointView.prototype = new GeometryView();

PointView.prototype.edit = function() {
  this.geom.dragging.enable();
};

/**
 * returns a function to handle events fot evtType
 */
PointView.prototype._eventHandler = function(evtType) {
  var self = this;
  var h = this._eventHandlers[evtType];
  if(!h) {
    h = function(e) {
      var latlng = e.target.getLatLng();
      var s = [latlng.lat, latlng.lng];
      self.trigger(evtType, e.originalEvent, s);
    };
    this._eventHandlers[evtType] = h;
  }
  return h;
};

/**
 * view for other geometries (polygons/lines)
 */
function PathView(geometryModel) {
  var self = this;
  // events to link
  var events = [
    'click',
    'dblclick',
    'mousedown',
    'mouseover',
    'mouseout',
  ];

  this._eventHandlers = {};
  this.model = geometryModel;
  this.points = [];

  
  this.geom = L.GeoJSON.geometryToLayer(geometryModel.get('geojson'));

  _.each(this.geom._layers, function(g) {
    g.setStyle(geometryModel.get('style'));
    g.on('edit', function() {
      geometryModel.set('geojson', L.GeoJSON.toGeoJSON(self.geom));
    }, self);
  });
  /*for(var i = 0; i < events.length; ++i) {
    var e = events[i];
    this.geom.on(e, self._eventHandler(e));
  }*/

}

PathView.prototype = new GeometryView();

PathView.prototype.edit = function(enable) {
  var fn = enable ? 'enable': 'disable';
  _.each(this.geom._layers, function(g) {
    g.editing[fn]();
    g.off('edit', null, self);
  });
};

cdb.geo.leaflet = cdb.geo.leaflet || {};

cdb.geo.leaflet.PointView = PointView;
cdb.geo.leaflet.PathView = PathView;


})();

(function() {
  /**
  * base layer for all leaflet layers
  */
  var LeafLetLayerView = function(layerModel, leafletLayer, leafletMap) {
    this.leafletLayer = leafletLayer;
    this.leafletMap = leafletMap;
    this.model = layerModel;

    this.model.bind('change', this._modelUpdated, this);
    this.type = layerModel.get('type') || layerModel.get('kind');
    this.type = this.type.toLowerCase();
  };

  _.extend(LeafLetLayerView.prototype, Backbone.Events);
  _.extend(LeafLetLayerView.prototype, {

    /**
    * remove layer from the map and unbind events
    */
    remove: function() {
      this.leafletMap.removeLayer(this.leafletLayer);
      this.model.unbind(null, null, this);
      this.unbind();
    },

    show: function() {
      this.leafletLayer.setOpacity(1.0);
    },

    hide: function() {
      this.leafletLayer.setOpacity(0.0);
    },

    /**
     * reload the tiles
     */
    reload: function() {
      this.leafletLayer.redraw();
    }

  });


  cdb.geo.LeafLetLayerView = LeafLetLayerView;


})();

(function() {

if(typeof(L) == "undefined") 
  return;

/**
 * this is a dummy layer class that modifies the leaflet DOM element background 
 * instead of creating a layer with div
 */
var LeafLetPlainLayerView = L.Class.extend({
  includes: L.Mixin.Events,

  initialize: function(layerModel, leafletMap) {
    cdb.geo.LeafLetLayerView.call(this, layerModel, this, leafletMap);
  },

  onAdd: function() {
    this.redraw();
  },

  onRemove: function() { 
    var div = this.leafletMap.getContainer()
    div.style.background = 'none';
  },

  _modelUpdated: function() {
    this.redraw();
  },

  redraw: function() {
    var div = this.leafletMap.getContainer()
    div.style.backgroundColor = this.model.get('color') || '#FFF';
    if(this.model.get('image')) {
      var st = 'url(' + this.model.get('image') + ') repeat center center';
      if(this.model.get('color')) {
        div.style.background = st + ' ' + this.model.get('color');
      }
    }
  }
});

_.extend(LeafLetPlainLayerView.prototype, cdb.geo.LeafLetLayerView.prototype);

cdb.geo.LeafLetPlainLayerView = LeafLetPlainLayerView;

})();

(function() {

if(typeof(L) == "undefined") 
  return;

var LeafLetTiledLayerView = L.TileLayer.extend({
  initialize: function(layerModel, leafletMap) {
    L.TileLayer.prototype.initialize.call(this, layerModel.get('urlTemplate'), {
      tms:          layerModel.get('tms'),
      attribution:  layerModel.get('attribution'),
      minZoom:      layerModel.get('minZomm'),
      maxZoom:      layerModel.get('maxZoom'),
      subdomains:   layerModel.get('subdomains') || 'abc',
      errorTileUrl: layerModel.get('errorTileUrl'),
      opacity:      layerModel.get('opacity')
    });
    cdb.geo.LeafLetLayerView.call(this, layerModel, this, leafletMap);
  }

});

_.extend(LeafLetTiledLayerView.prototype, cdb.geo.LeafLetLayerView.prototype, {

  _modelUpdated: function() {
    _.defaults(this.leafletLayer.options, _.clone(this.model.attributes));
    this.leafletLayer.setUrl(this.model.get('urlTemplate'));
  }

});

cdb.geo.LeafLetTiledLayerView = LeafLetTiledLayerView;

})();
/**
 * @name cartodb-leaflet
 * @author: Vizzuality.com
 * @fileoverview <b>Author:</b> Vizzuality.com<br/> <b>Licence:</b>
 *               Licensed under <a
 *               href="http://opensource.org/licenses/mit-license.php">MIT</a>
 *               license.<br/> This library lets you to use CartoDB with Leaflet.
 *
 */


(function() {

if(typeof(L) == "undefined")
  return;

L.CartoDBLayer = L.TileLayer.extend({

  options: {
    query:          "SELECT * FROM {{table_name}}",
    opacity:        0.99,
    attribution:    "CartoDB",
    debug:          false,
    visible:        true,
    added:          false,
    tiler_domain:   "cartodb.com",
    tiler_port:     "80",
    tiler_protocol: "http",
    sql_domain:     "cartodb.com",
    sql_port:       "80",
    sql_protocol:   "http",
    extra_params:   {},
    cdn_url:        null,
    subdomains:     null
  },


  initialize: function (options) {
    // Set options
    L.Util.setOptions(this, options);

    // Some checks
    if (!options.table_name || !options.map) {
      if (options.debug) {
        throw('cartodb-leaflet needs at least a CartoDB table name and the Leaflet map object :(');
      } else { return }
    }

    this.fire = this.trigger;

    L.TileLayer.prototype.initialize.call(this);
  },


  // overwrite getTileUrl in order to
  // support different tiles subdomains in tilejson way
  getTileUrl: function (tilePoint) {
    this._adjustTilePoint(tilePoint);

    var tiles = this.tilejson.tiles;

    var index = (tilePoint.x + tilePoint.y) % tiles.length;

    return L.Util.template(tiles[index], L.Util.extend({
      z: this._getZoomForUrl(),
      x: tilePoint.x,
      y: tilePoint.y
    }, this.options));
  },

  /**
   * Change opacity of the layer
   * @params {Integer} New opacity
   */
  setOpacity: function(opacity) {

    this._checkLayer();

    if (isNaN(opacity) || opacity>1 || opacity<0) {
      throw new Error(opacity + ' is not a valid value');
    }

    // Leaflet only accepts 0-0.99... Weird!
    this.options.opacity = Math.min(opacity, 0.99);

    if (this.options.visible) {
      L.TileLayer.prototype.setOpacity.call(this, this.options.opacity);
      this.fire('updated');
    }
  },


  /**
   * When Leaflet adds the layer... go!
   * @params {map}
   */
  onAdd: function(map) {
    this.__update();
    this.fire('added');
    this.options.added = true;
    L.TileLayer.prototype.onAdd.call(this, map);
  },


  /**
   * When removes the layer, destroy interactivity if exist
   */
  onRemove: function(map) {
    this.options.added = false;
    L.TileLayer.prototype.onRemove.call(this, map);
  },

  /**
   * Update CartoDB layer
   * generates a new url for tiles and refresh leaflet layer
   * do not collide with leaflet _update
   */
  __update: function() {
    var self = this;
    this.fire('updated');

    // generate the tilejson
    this.tilejson = this._tileJSON();

    // check the tiles
    this._checkTiles();

    if(this.interaction) {
      this.interaction.remove();
      this.interaction = null;
    }

    // add the interaction?
    if (this.options.interactivity && this.options.interaction) {
      this.interaction = wax.leaf.interaction()
        .map(this.options.map)
        .tilejson(this.tilejson)
        .on('on', function(o) {
          self._bindWaxOnEvents(self.options.map,o)
        })
        .on('off', function(o) {
          self._bindWaxOffEvents()
        });
    }

    this.setUrl(this.tilejson.tiles[0]);
  },

  _checkLayer: function() {
    if (!this.options.added) {
      throw new Error('the layer is not still added to the map');
    }
  },



  /**
   * Change query of the tiles
   * @params {str} New sql for the tiles
   */
  setQuery: function(sql) {

    this._checkLayer();

    this.setOptions({
      query: sql
    });

  },


  /**
   * Change style of the tiles
   * @params {style} New carto for the tiles
   */
  setCartoCSS: function(style, version) {
    this._checkLayer();

    version = version || cdb.CARTOCSS_DEFAULT_VERSION;

    this.setOptions({
      tile_style: style,
      style_version: version
    });

  },


  /**
   * Change the query when clicks in a feature
   * @params {Boolean | String} New sql for the request
   */
  setInteractivity: function(value) {

    if (!this.options.added) {
      if (this.options.debug) {
        throw('the layer is not still added to the map');
      } else { return }
    }

    if (!isNaN(value)) {
      if (this.options.debug) {
        throw(value + ' is not a valid setInteractivity value');
      } else { return }
    }

    this.setOptions({
      interactivity: value
    });

  },


  /**
   * Active or desactive interaction
   * @params {Boolean} Choose if wants interaction or not
   */
  setInteraction: function(enable) {
    this.setOptions({
      interaction: enable
    })
  },


  /**
   * Set a new layer attribution
   * @params {String} New attribution string
   */
  setAttribution: function(attribution) {
    this._checkLayer();

    // Remove old one
    this.map.attributionControl.removeAttribution(this.options.attribution);

    // Set new attribution in the options
    this.options.attribution = attribution;

    // Change text
    this.map.attributionControl.addAttribution(this.options.attribution);

    // Change in the layer
    this.options.attribution = this.options.attribution;
    this.tilejson.attribution = this.options.attribution;

    this.fire('updated');
  },


  /**
   * Change multiple options at the same time
   * @params {Object} New options object
   */
  setOptions: function(opts) {

    if (typeof opts != "object" || opts.length) {
      throw new Error(opts + ' options has to be an object');
    }

    L.Util.setOptions(this, opts);

    if(opts.interactivity) {
      var i = opts.interactivity;
      this.options.interactivity = i.join ? i.join(','): i;
    }
    if(opts.opacity !== undefined) {
      this.setOpacity(this.options.opacity);
    }

    // Update tiles
    if(opts.query != undefined || opts.style != undefined || opts.tile_style != undefined || opts.interactivity != undefined || opts.interaction != undefined) {
      this.__update();
    }
  },


  /**
   * Returns if the layer is visible or not
   */
  isVisible: function() {
    return this.options.visible
  },


  /**
   * Returns if the layer belongs to the map
   */
  isAdded: function() {
    return this.options.added
  },


  /**
   * Bind events for wax interaction
   * @param {Object} Layer map object
   * @param {Event} Wax event
   */
  _bindWaxOnEvents: function(map,o) {
    var layer_point = this._findPos(map,o)
      , latlng = map.layerPointToLatLng(layer_point)
      , event_type = o.e.type.toLowerCase();

    var screenPos = map.layerPointToContainerPoint(layer_point);

    switch (event_type) {
      case 'mousemove':
        if (this.options.featureOver) {
          return this.options.featureOver(o.e,latlng, screenPos, o.data);
        }
        break;

      case 'click':
      case 'touchend':
      case 'mspointerup':
        if (this.options.featureClick) {
          this.options.featureClick(o.e,latlng, screenPos, o.data);
        }
        break;
      default:
        break;
    }
  },


  /**
   * Bind off event for wax interaction
   */
  _bindWaxOffEvents: function(){
    if (this.options.featureOut) {
      return this.options.featureOut && this.options.featureOut();
    }
  },

  /**
   * Get the Leaflet Point of the event
   * @params {Object} Map object
   * @params {Object} Wax event object
   */
  _findPos: function (map,o) {
    var curleft = 0, curtop = 0;
    var obj = map.getContainer();


    if (obj.offsetParent) {
      // Modern browsers
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return map.containerPointToLayerPoint(new L.Point((o.e.clientX || o.e.changedTouches[0].clientX) - curleft,(o.e.clientY || o.e.changedTouches[0].clientY) - curtop))
    } else {
      // IE
      return map.mouseEventToLayerPoint(o.e)
    }
  }

});

/**
 * leatlet cartodb layer
 */

var LeafLetLayerCartoDBView = L.CartoDBLayer.extend({
  //var LeafLetLayerCartoDBView = function(layerModel, leafletMap) {
  initialize: function(layerModel, leafletMap) {
    var self = this;

    _.bindAll(this, 'featureOut', 'featureOver', 'featureClick');

    var opts = _.clone(layerModel.attributes);
    if(layerModel.get('use_server_style')) {
      opts.tile_style = null;
    }

    opts.map =  leafletMap;

    var // preserve the user's callbacks
    _featureOver  = opts.featureOver,
    _featureOut   = opts.featureOut,
    _featureClick = opts.featureClick;

    opts.featureOver  = function() {
      _featureOver  && _featureOver.apply(this, arguments);
      self.featureOver  && self.featureOver.apply(this, arguments);
    };

    opts.featureOut  = function() {
      _featureOut  && _featureOut.apply(this, arguments);
      self.featureOut  && self.featureOut.apply(this, arguments);
    };

    opts.featureClick  = function() {
      _featureClick  && _featureClick.apply(this, arguments);
      self.featureClick  && self.featureClick.apply(opts, arguments);
    };

    L.CartoDBLayer.prototype.initialize.call(this, opts);
    cdb.geo.LeafLetLayerView.call(this, layerModel, this, leafletMap);

  },

  _modelUpdated: function() {
    var attrs = _.clone(this.model.attributes);
    // if we want to use the style stored in the server
    // but we want to store it in the layer model
    // we should remove it from layer options
    if(this.model.get('use_server_style')) {
      attrs.tile_style = null;
    }

    this.leafletLayer.setOptions(attrs);

  },

  featureOver: function(e, latlon, pixelPos, data) {
    // dont pass leaflet lat/lon
    this.trigger('featureOver', e, [latlon.lat, latlon.lng], pixelPos, data);
  },

  featureOut: function(e) {
    this.trigger('featureOut', e);
  },

  featureClick: function(e, latlon, pixelPos, data) {
    // dont pass leaflet lat/lon
    this.trigger('featureClick', e, [latlon.lat, latlon.lng], pixelPos, data);
  },

  reload: function() {
    this.model.invalidate();
    //this.redraw();
  },

  error: function(e) {
    this.trigger('error', e?e.error:'unknown error');
    this.model.trigger('tileError', e?e.error:'unknown error');
  },

  tilesOk: function(e) {
    this.model.trigger('tileOk');
  },

  includes: [
    cdb.geo.LeafLetLayerView.prototype,
    CartoDBLayerCommon.prototype,
    Backbone.Events
  ]

});

/*_.extend(L.CartoDBLayer.prototype, CartoDBLayerCommon.prototype);

_.extend(
  LeafLetLayerCartoDBView.prototype,
  cdb.geo.LeafLetLayerView.prototype,
  L.CartoDBLayer.prototype,
  Backbone.Events, // be sure this is here to not use the on/off from leaflet

  */
cdb.geo.LeafLetLayerCartoDBView = LeafLetLayerCartoDBView;

})();
/**
* leaflet implementation of a map
*/
(function() {

  if(typeof(L) == "undefined")
    return;

  /**
   * leatlef impl
   */
  cdb.geo.LeafletMapView = cdb.geo.MapView.extend({


    initialize: function() {

      _.bindAll(this, '_addLayer', '_removeLayer', '_setZoom', '_setCenter', '_setView');

      cdb.geo.MapView.prototype.initialize.call(this);

      var self = this;

      var center = this.map.get('center');

      var mapConfig = {
        zoomControl: false,
        center: new L.LatLng(center[0], center[1]),
        zoom: this.map.get('zoom'),
        minZoom: this.map.get('minZoom'),
        maxZoom: this.map.get('maxZoom')
      };
      if (this.map.get('bounding_box_ne')) {
        //mapConfig.maxBounds = [this.map.get('bounding_box_ne'), this.map.get('bounding_box_sw')];
      }

      if(!this.options.map_object) {
        this.map_leaflet = new L.Map(this.el, mapConfig);

        // remove the "powered by leaflet"
        this.map_leaflet.attributionControl.setPrefix('');

        // Disable the scrollwheel
        if (this.map.get("scrollwheel") == false) this.map_leaflet.scrollWheelZoom.disable();

      } else {
        this.map_leaflet = this.options.map_object;
        this.setElement(this.map_leaflet.getContainer());
        var c = self.map_leaflet.getCenter();
        self._setModelProperty({ center: [c.lat, c.lng] });
        self._setModelProperty({ zoom: self.map_leaflet.getZoom() });
        // unset bounds to not change mapbounds
        self.map.unset('view_bounds_sw', { silent: true });
        self.map.unset('view_bounds_ne', { silent: true });
      }


      this.map.bind('set_view', this._setView, this);
      this.map.layers.bind('add', this._addLayer, this);
      this.map.layers.bind('remove', this._removeLayer, this);
      this.map.layers.bind('reset', this._addLayers, this);

      this.map.geometries.bind('add', this._addGeometry, this);
      this.map.geometries.bind('remove', this._removeGeometry, this);

      this._bindModel();

      this._addLayers();

      this.map_leaflet.on('layeradd', function(lyr) {
        this.trigger('layeradd', lyr, self);
      }, this);

      this.map_leaflet.on('zoomstart', function() {
        self.trigger('zoomstart');
      });

      this.map_leaflet.on('click', function(e) {
        self.trigger('click', e.originalEvent, [e.latlng.lat, e.latlng.lng]);
      });

      this.map_leaflet.on('dblclick', function(e) {
        self.trigger('dblclick', e.originalEvent);
      });

      this.map_leaflet.on('zoomend', function() {
        self._setModelProperty({
          zoom: self.map_leaflet.getZoom()
        });
        self.trigger('zoomend');
      }, this);

      this.map_leaflet.on('move', function() {
        var c = self.map_leaflet.getCenter();
        self._setModelProperty({ center: [c.lat, c.lng] });
      });

      this.map_leaflet.on('drag', function() {
        var c = self.map_leaflet.getCenter();
        self._setModelProperty({
          center: [c.lat, c.lng]
        });
        self.trigger('drag');
      }, this);

      this.map.bind('change:maxZoom', function() {
        L.Util.setOptions(self.map_leaflet, { maxZoom: self.map.get('maxZoom') });
      }, this);

      this.map.bind('change:minZoom', function() {
        L.Util.setOptions(self.map_leaflet, { minZoom: self.map.get('minZoom') });
      }, this);

      this.trigger('ready');

      // looks like leaflet dont like to change the bounds just after the inicialization
      var bounds = this.map.getViewBounds();
      if(bounds) {
        this.showBounds(bounds);
      }
    },


    clean: function() {
      //see https://github.com/CloudMade/Leaflet/issues/1101
      L.DomEvent.off(window, 'resize', this.map_leaflet._onResize, this.map_leaflet);

      // remove layer views
      for(var layer in this.layers) {
        var layer_view = this.layers[layer];
        layer_view.remove();
        delete this.layers[layer];
      }

      // do not change by elder
      cdb.core.View.prototype.clean.call(this);
    },

    _setScrollWheel: function(model, z) {
      if (z) {
        this.map_leaflet.scrollWheelZoom.enable();
      } else {
        this.map_leaflet.scrollWheelZoom.disable();
      }
    },

    _setZoom: function(model, z) {
      this._setView();
    },

    _setCenter: function(model, center) {
      this._setView();
    },

    _setView: function() {
      this.map_leaflet.setView(this.map.get("center"), this.map.get("zoom") || 0 );
    },

    _addGeomToMap: function(geom) {
      var geo = cdb.geo.LeafletMapView.createGeometry(geom);
      geo.geom.addTo(this.map_leaflet);
      return geo;
    },

    _removeGeomFromMap: function(geo) {
      this.map_leaflet.removeLayer(geo.geom);
    },

    createLayer: function(layer) {
      return cdb.geo.LeafletMapView.createLayer(layer, this.map_leaflet);
    },

    _addLayer: function(layer, layers, opts) {
      var self = this;
      var lyr, layer_view;

      layer_view = cdb.geo.LeafletMapView.createLayer(layer, this.map_leaflet);
      if(!layer_view) {
        return;
      }

      var appending = !opts || opts.index === undefined || opts.index === _.size(this.layers);
      // since leaflet does not support layer ordering
      // add the layers should be removed and added again
      // if the layer is being appended do not clear
      if(!appending) {
        for(var i in this.layers) {
          this.map_leaflet.removeLayer(this.layers[i]);
        }
      }

      this.layers[layer.cid] = layer_view;

      // add them again, in correct order
      if(appending) {
        cdb.geo.LeafletMapView.addLayerToMap(layer_view, self.map_leaflet);
      } else {
        this.map.layers.each(function(layerModel) {
          var v = self.layers[layerModel.cid];
          if(v) {
            cdb.geo.LeafletMapView.addLayerToMap(v, self.map_leaflet);
          }
        });
      }

      var attribution = layer.get('attribution');

      if (attribution) {
        // Setting attribution in map model
        var attributions = this.map.get('attribution') || [];
        if (!_.contains(attributions, attribution)) {
          attributions.push(attribution);
        }

        this.map.set({ attribution: attributions });
      }

      this.trigger('newLayerView', layer_view, this);
    },

    latLonToPixel: function(latlon) {
      var point = this.map_leaflet.latLngToLayerPoint(new L.LatLng(latlon[0], latlon[1]));
      return this.map_leaflet.layerPointToContainerPoint(point);
    },

    // return the current bounds of the map view
    getBounds: function() {
      var b = this.map_leaflet.getBounds();
      var sw = b.getSouthWest();
      var ne = b.getNorthEast();
      return [
        [sw.lat, sw.lng],
        [ne.lat, ne.lng]
      ];
    },

    setAttribution: function(m) {
      // Leaflet takes care of attribution by its own.
    },

    getSize: function() {
      return this.map_leaflet.getSize();
    },

    panBy: function(p) {
      this.map_leaflet.panBy(new L.Point(p.x, p.y));
    },

    setCursor: function(cursor) {
      $(this.map_leaflet.getContainer()).css('cursor', cursor);
    },

    getNativeMap: function() {
      return this.map_leaflet;
    },

    invalidateSize: function() {
      this.map_leaflet.invalidateSize();
    }

  }, {

    layerTypeMap: {
      "tiled": cdb.geo.LeafLetTiledLayerView,
      "cartodb": cdb.geo.LeafLetLayerCartoDBView,
      "carto": cdb.geo.LeafLetLayerCartoDBView,
      "plain": cdb.geo.LeafLetPlainLayerView,
      // for google maps create a plain layer
      "gmapsbase": cdb.geo.LeafLetPlainLayerView
    },

    createLayer: function(layer, map) {
      var layer_view = null;
      var layerClass = this.layerTypeMap[layer.get('type').toLowerCase()];

      if (layerClass) {
        layer_view = new layerClass(layer, map);
      } else {
        cdb.log.error("MAP: " + layer.get('type') + " can't be created");
      }
      return layer_view;
    },

    addLayerToMap: function(layer_view, map) {
      map.addLayer(layer_view.leafletLayer);
    },

    /**
     * create the view for the geometry model
     */
    createGeometry: function(geometryModel) {
      if(geometryModel.isPoint()) {
        return new cdb.geo.leaflet.PointView(geometryModel);
      }
      return new cdb.geo.leaflet.PathView(geometryModel);
    }

  });

  // set the image path in order to be able to get leaflet icons
  // code adapted from leaflet
  L.Icon.Default.imagePath = (function () {
    var scripts = document.getElementsByTagName('script'),
        leafletRe = /\/?cartodb[\-\._]?([\w\-\._]*)\.js\??/;

    var i, len, src, matches;

    for (i = 0, len = scripts.length; i < len; i++) {
      src = scripts[i].src;
      matches = src.match(leafletRe);

      if (matches) {
        var bits = src.split('/')
        delete bits[bits.length - 1];
        return bits.join('/') + 'themes/css/images';
      }
    }
  }());

})();

(function() {

if(typeof(google) == "undefined" || typeof(google.maps) == "undefined") 
  return;

/**
* base layer for all google maps
*/

var GMapsLayerView = function(layerModel, gmapsLayer, gmapsMap) {
  this.gmapsLayer = gmapsLayer;
  this.map = this.gmapsMap = gmapsMap;
  this.model = layerModel;
  this.model.bind('change', this._update, this);

  this.type = layerModel.get('type') || layerModel.get('kind');
  this.type = this.type.toLowerCase();
};

_.extend(GMapsLayerView.prototype, Backbone.Events);
_.extend(GMapsLayerView.prototype, {

  /**
   * remove layer from the map and unbind events
   */
  remove: function() {
    if(!this.isBase) {
      this.gmapsMap.overlayMapTypes.removeAt(this.index);
      this.model.unbind(null, null, this);
      this.unbind();
    }
  },

  refreshView: function() {
    var self = this;
    //reset to update
    if(this.isBase) {
      var a = '_baseLayer';
      this.gmapsMap.setMapTypeId(null);
      this.gmapsMap.mapTypes.set(a, this.gmapsLayer);
      this.gmapsMap.setMapTypeId(a);
    } else {
      self.gmapsMap.overlayMapTypes.forEach(
        function(layer, i) {
          if (layer == self) {
            self.gmapsMap.overlayMapTypes.setAt(i, self);
            return;
          }
        }
      );
    }
  },

  /*

  show: function() {
    this.gmapsLayer.show();
  },

  hide: function() {
    this.gmapsLayer.hide();
  },
  */

  reload: function() { this.refreshView() ; },
  _update: function() { this.refreshView(); }


});

cdb.geo.GMapsLayerView = GMapsLayerView;

})();

(function() {

if(typeof(google) == "undefined" || typeof(google.maps) == "undefined")
  return;

var GMapsBaseLayerView = function(layerModel, gmapsMap) {
  cdb.geo.GMapsLayerView.call(this, layerModel, null, gmapsMap);
};

_.extend(
  GMapsBaseLayerView.prototype,
  cdb.geo.GMapsLayerView.prototype,
  {
  _update: function() {
    var m = this.model;
    var types = {
      "roadmap":      google.maps.MapTypeId.ROADMAP,
      "gray_roadmap": google.maps.MapTypeId.ROADMAP,
      "dark_roadmap": google.maps.MapTypeId.ROADMAP,
      "hybrid":       google.maps.MapTypeId.HYBRID,
      "satellite":    google.maps.MapTypeId.SATELLITE,
      "terrain":      google.maps.MapTypeId.TERRAIN
    };

    this.gmapsMap.setOptions({
      mapTypeId: types[m.get('base_type')]
    });

    this.gmapsMap.setOptions({
      styles: m.get('style') || DEFAULT_MAP_STYLE
    });
  },
  remove: function() { }
});


cdb.geo.GMapsBaseLayerView = GMapsBaseLayerView;


})();

(function() {

if(typeof(google) == "undefined" || typeof(google.maps) == "undefined") 
  return;

var GMapsPlainLayerView = function(layerModel, gmapsMap) {
  this.color = layerModel.get('color')
  cdb.geo.GMapsLayerView.call(this, layerModel, this, gmapsMap);
};

_.extend(
  GMapsPlainLayerView.prototype,
  cdb.geo.GMapsLayerView.prototype, {

  _update: function() {
    this.color = this.model.get('color')
    this.refreshView();
  },

  getTile: function(coord, zoom, ownerDocument) {
      var div = document.createElement('div');
      div.style.width = this.tileSize.x;
      div.style.height = this.tileSize.y;
      div['background-color'] = this.color;
      return div;
  },

  tileSize: new google.maps.Size(256,256),
  maxZoom: 100,
  minZoom: 0,
  name:"plain layer",
  alt: "plain layer"
});

cdb.geo.GMapsPlainLayerView = GMapsPlainLayerView;

})();

(function() {

if(typeof(google) == "undefined" || typeof(google.maps) == "undefined") 
  return;

// TILED LAYER
var GMapsTiledLayerView = function(layerModel, gmapsMap) {
  cdb.geo.GMapsLayerView.call(this, layerModel, this, gmapsMap);
  this.tileSize = new google.maps.Size(256, 256);
  this.opacity = 1.0;
  this.isPng = true;
  this.maxZoom = 22;
  this.minZoom = 0;
  this.name= 'cartodb tiled layer';
  google.maps.ImageMapType.call(this, this);
};

_.extend(
  GMapsTiledLayerView.prototype,
  cdb.geo.GMapsLayerView.prototype,
  google.maps.ImageMapType.prototype, {

    getTileUrl: function(tile, zoom) {
      var y = tile.y;
      var tileRange = 1 << zoom;
      if (y < 0 || y  >= tileRange) {
        return null;
      }
      var x = tile.x;
      if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
      }
      if(this.model.get('tms')) {
        y = tileRange - y - 1;
      }
      var urlPattern = this.model.get('urlTemplate');
      return urlPattern
                  .replace("{x}",x)
                  .replace("{y}",y)
                  .replace("{z}",zoom);
    }
});

cdb.geo.GMapsTiledLayerView = GMapsTiledLayerView;


})();
(function() {
// if google maps is not defined do not load the class
if(typeof(google) == "undefined" || typeof(google.maps) == "undefined")
  return;

// helper to get pixel position from latlon
var Projector = function(map) { this.setMap(map); };
Projector.prototype = new google.maps.OverlayView();
Projector.prototype.draw = function() {};
Projector.prototype.latLngToPixel = function(point) {
  var p = this.getProjection();
  if(p) {
    return p.fromLatLngToContainerPixel(point);
  }
  return [0, 0];
};
Projector.prototype.pixelToLatLng = function(point) {
  var p = this.getProjection();
  if(p) {
    return p.fromContainerPixelToLatLng(point);
  }
  return [0, 0];
  //return this.map.getProjection().fromPointToLatLng(point);
};

var CartoDBLayer = function(opts) {

  var default_options = {
    query:          "SELECT * FROM {{table_name}}",
    attribution:    "CartoDB",
    opacity:        1,
    debug:          false,
    visible:        true,
    added:          false,
    loaded:         null,
    loading:        null,
    layer_order:    "top",
    tiler_domain:   "cartodb.com",
    tiler_port:     "80",
    tiler_protocol: "http",
    sql_domain:     "cartodb.com",
    sql_port:       "80",
    sql_protocol:   "http",
    subdomains:      null
  };

  this.options = _.defaults(opts, default_options);
  opts.tiles = this._tileJSON().tiles;

  // Set init
  this.tiles = 0;

  // Add CartoDB logo
  this._addWadus({left: 74, bottom:8}, 2000, this.options.map.getDiv());

  wax.g.connector.call(this, opts);

  // lovely wax connector overwrites options so set them again
  // TODO: remove wax.connector here
   _.extend(this.options, opts);
  this.projector = new Projector(opts.map);
  this._addInteraction();
  this._checkTiles();
};

CartoDBLayer.Projector = Projector;

CartoDBLayer.prototype = new wax.g.connector();
_.extend(CartoDBLayer.prototype, CartoDBLayerCommon.prototype);


CartoDBLayer.prototype.setOpacity = function(opacity) {

  this._checkLayer();

  if (isNaN(opacity) || opacity > 1 || opacity < 0) {
    throw new Error(opacity + ' is not a valid value, should be in [0, 1] range');
  }
  this.opacity = this.options.opacity = opacity;
  for(var key in this.cache) {
    var img = this.cache[key];
    img.style.opacity = opacity;
    img.style.filter = "alpha(opacity=" + (opacity*100) + ");"

    //img.setAttribute("style","opacity: " + opacity + "; filter: alpha(opacity="+(opacity*100)+");");
  }

};

CartoDBLayer.prototype.setAttribution = function() {};

CartoDBLayer.prototype.getTile = function(coord, zoom, ownerDocument) {

  var self = this;

  this.options.added = true;

  var im = wax.g.connector.prototype.getTile.call(this, coord, zoom, ownerDocument);

  if (this.tiles == 0) {
    this.loading && this.loading();
    //this.trigger("loading");
  }

  this.tiles++;


  im.onload = im.onerror = function() {
    self.tiles--;
    if (self.tiles == 0) {
      self.finishLoading && self.finishLoading();
    }
  }

  return im;
}

CartoDBLayer.prototype._addInteraction = function () {
  var self = this;
  // add interaction
  if(this.interaction) {
    this.interaction.remove();
    this.interaction = null;
  }

  if(this.options.interaction) {
    this.interaction = wax.g.interaction()
      .map(this.options.map)
      .tilejson(this._tileJSON())
      .on('on',function(o) {
        self._manageOnEvents(self.options.map, o);
      })
      .on('off', function(o) {
        self._manageOffEvents();
      });
  }
};

CartoDBLayer.prototype.clear = function () {
  if (this.interaction) {
    this.interaction.remove();
    delete this.interaction;
  }
  self.finishLoading && self.finishLoading();
};

CartoDBLayer.prototype.update = function () {
  var tilejson = this._tileJSON();
  // clear wax cache
  this.cache = {};
  // set new tiles to wax
  this.options.tiles = tilejson.tiles;
  this._addInteraction();

  this._checkTiles();

  // reload the tiles
  this.refreshView();
};


CartoDBLayer.prototype.refreshView = function() {
}

/**
 * Active or desactive interaction
 * @params {Boolean} Choose if wants interaction or not
 */
CartoDBLayer.prototype.setInteraction = function(enable) {
  this.setOptions({
    interaction: enable
  });

};


CartoDBLayer.prototype.setOptions = function (opts) {
  _.extend(this.options, opts);

  if (typeof opts != "object" || opts.length) {
    throw new Error(opts + ' options has to be an object');
  }

  if(opts.interactivity) {
    var i = opts.interactivity;
    this.options.interactivity = i.join ? i.join(','): i;
  }
  if(opts.opacity !== undefined) {
    this.setOpacity(this.options.opacity);
  }

  // Update tiles
  if(opts.query != undefined || opts.style != undefined || opts.tile_style != undefined || opts.interactivity != undefined || opts.interaction != undefined) {
    this.update();
  }
}

CartoDBLayer.prototype._checkLayer = function() {
  if (!this.options.added) {
    throw new Error('the layer is not still added to the map');
  }
}
/**
 * Change query of the tiles
 * @params {str} New sql for the tiles
 * @params {Boolean}  Choose if the map fits to the sql results bounds (thanks to @fgblanch)
*/
CartoDBLayer.prototype.setQuery = function(sql) {

  this._checkLayer();

  /*if (fitToBounds)
    this.setBounds(sql)
    */

  // Set the new value to the layer options
  this.options.query = sql;
  this.update();
}

CartoDBLayer.prototype.isVisible = function() {
  return this.options.visible;
}

CartoDBLayer.prototype.setCartoCSS = function(style, version) {

  this._checkLayer();

  version = version || cdb.CARTOCSS_DEFAULT_VERSION;

  this.setOptions({
    tile_style: style,
    style_version: version
  });
}


/**
 * Change the query when clicks in a feature
 * @params { Boolean || String } New sql for the request
 */
CartoDBLayer.prototype.setInteractivity = function(fieldsArray) {

  this._checkLayer();

  if (!fieldsArray) {
    throw new Error('should specify fieldsArray');
  }

  // Set the new value to the layer options
  this.options.interactivity = fieldsArray.join ? fieldsArray.join(','): fieldsArray;
  // Update tiles
  this.update();
}



CartoDBLayer.prototype._findPos = function (map,o) {
  var curleft, cartop;
  curleft = curtop = 0;
  var obj = map.getDiv();
  do {
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
  } while (obj = obj.offsetParent);
  return new google.maps.Point(
      (o.e.clientX || o.e.changedTouches[0].clientX) - curleft,
      (o.e.clientY || o.e.changedTouches[0].clientY) - curtop
  );
};

CartoDBLayer.prototype._manageOffEvents = function(){
  if (this.options.featureOut) {
    return this.options.featureOut && this.options.featureOut();
  }
};


CartoDBLayer.prototype._manageOnEvents = function(map,o) {
  var point = this._findPos(map, o)
    , latlng = this.projector.pixelToLatLng(point)
    , event_type = o.e.type.toLowerCase();

  switch (event_type) {
    case 'mousemove':
      if (this.options.featureOver) {
        return this.options.featureOver(o.e,latlng, point, o.data);
      }
      break;

    case 'click':
    case 'touchend':
    case 'mspointerup':
      if (this.options.featureClick) {
        this.options.featureClick(o.e,latlng, point, o.data);
      }
      break;
    default:
      break;
  }
}



cdb.geo.CartoDBLayerGMaps = CartoDBLayer;

/**
* gmaps cartodb layer
*/

var GMapsCartoDBLayerView = function(layerModel, gmapsMap) {
  var self = this;

  _.bindAll(this, 'featureOut', 'featureOver', 'featureClick');

  // CartoDB new attribution,
  // also we have the logo
  layerModel.attributes.attribution = "CartoDB <a href='http://cartodb.com/attributions' target='_blank'>attribution</a>";

  var opts = _.clone(layerModel.attributes);

  opts.map =  gmapsMap;

  var // preserve the user's callbacks
  _featureOver  = opts.featureOver,
  _featureOut   = opts.featureOut,
  _featureClick = opts.featureClick;

  opts.featureOver  = function() {
    _featureOver  && _featureOver.apply(this, arguments);
    self.featureOver  && self.featureOver.apply(this, arguments);
  };

  opts.featureOut  = function() {
    _featureOut  && _featureOut.apply(this, arguments);
    self.featureOut  && self.featureOut.apply(this, arguments);
  };

  opts.featureClick  = function() {
    _featureClick  && _featureClick.apply(this, arguments);
    self.featureClick  && self.featureClick.apply(opts, arguments);
  };

  cdb.geo.CartoDBLayerGMaps.call(this, opts);
  cdb.geo.GMapsLayerView.call(this, layerModel, this, gmapsMap);
};

cdb.geo.GMapsCartoDBLayerView = GMapsCartoDBLayerView;


_.extend(
  GMapsCartoDBLayerView.prototype,
  cdb.geo.CartoDBLayerGMaps.prototype,
  cdb.geo.GMapsLayerView.prototype,
  {

  _update: function() {
    _.extend(this.options, this.model.attributes);

    this.update();

  },

  reload: function() {
    this.model.invalidate();
  },

  remove: function() {
    cdb.geo.GMapsLayerView.prototype.remove.call(this);
    this.clear();
  },

  featureOver: function(e, latlon, pixelPos, data) {
    // dont pass gmaps LatLng
    this.trigger('featureOver', e, [latlon.lat(), latlon.lng()], pixelPos, data);
  },

  featureOut: function(e) {
    this.trigger('featureOut', e);
  },

  featureClick: function(e, latlon, pixelPos, data) {
    // dont pass leaflet lat/lon
    this.trigger('featureClick', e, [latlon.lat(), latlon.lng()], pixelPos, data);
  },

  error: function(e) {
    if(this.model) {
      //trigger the error form _checkTiles in the model
      this.model.trigger('error', e?e.error:'unknown error');
      this.model.trigger('tileError', e?e.error:'unknown error');
    }
  },

  tilesOk: function(e) {
    this.model.trigger('tileOk');
  },

  loading: function() {
    this.trigger("loading");
  },

  finishLoading: function() {
    this.trigger("load");
  }


});

})();

// if google maps is not defined do not load the class
if(typeof(google) != "undefined" && typeof(google.maps) != "undefined") {

var DEFAULT_MAP_STYLE = [ { stylers: [ { saturation: -65 }, { gamma: 1.52 } ] },{ featureType: "administrative", stylers: [ { saturation: -95 }, { gamma: 2.26 } ] },{ featureType: "water", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "administrative.locality", stylers: [ { visibility: "off" } ] },{ featureType: "road", stylers: [ { visibility: "simplified" }, { saturation: -99 }, { gamma: 2.22 } ] },{ featureType: "poi", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "road.arterial", stylers: [ { visibility: "off" } ] },{ featureType: "road.local", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "transit", stylers: [ { visibility: "off" } ] },{ featureType: "road", elementType: "labels", stylers: [ { visibility: "off" } ] },{ featureType: "poi", stylers: [ { saturation: -55 } ] } ];



cdb.geo.GoogleMapsMapView = cdb.geo.MapView.extend({

  layerTypeMap: {
    "tiled": cdb.geo.GMapsTiledLayerView,
    "cartodb": cdb.geo.GMapsCartoDBLayerView,
    "carto": cdb.geo.GMapsCartoDBLayerView,
    "plain": cdb.geo.GMapsPlainLayerView,
    "gmapsbase": cdb.geo.GMapsBaseLayerView
  },

  initialize: function() {
    _.bindAll(this, '_ready');
    this._isReady = false;
    var self = this;

    cdb.geo.MapView.prototype.initialize.call(this);

    var bounds = this.map.getViewBounds();
    if(bounds) {
      this.showBounds(bounds);
    }
    var center = this.map.get('center');
    if(!this.options.map_object) {
      this.map_googlemaps = new google.maps.Map(this.el, {
        center: new google.maps.LatLng(center[0], center[1]),
        zoom: this.map.get('zoom'),
        minZoom: this.map.get('minZoom'),
        maxZoom: this.map.get('maxZoom'),
        disableDefaultUI: true,
        scrollwheel: this.map.get("scrollwheel"),
        mapTypeControl:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        backgroundColor: 'white'
      });
    } else {
      this.map_googlemaps = this.options.map_object;
      this.setElement(this.map_googlemaps.getDiv());
      // fill variables
      var c = self.map_googlemaps.getCenter();
      self._setModelProperty({ center: [c.lat(), c.lng()] });
      self._setModelProperty({ zoom: self.map_googlemaps.getZoom() });
      // unset bounds to not change mapbounds
      self.map.unset('view_bounds_sw', { silent: true });
      self.map.unset('view_bounds_ne', { silent: true });
    }


    this.map.geometries.bind('add', this._addGeometry, this);
    this.map.geometries.bind('remove', this._removeGeometry, this);


    this._bindModel();
    this._addLayers();

    google.maps.event.addListener(this.map_googlemaps, 'center_changed', function() {
        var c = self.map_googlemaps.getCenter();
        self._setModelProperty({ center: [c.lat(), c.lng()] });
    });

    google.maps.event.addListener(this.map_googlemaps, 'zoom_changed', function() {
      self._setModelProperty({
        zoom: self.map_googlemaps.getZoom()
      });
    });

    google.maps.event.addListener(this.map_googlemaps, 'click', function(e) {
        self.trigger('click', e, [e.latLng.lat(), e.latLng.lng()]);
    });

    google.maps.event.addListener(this.map_googlemaps, 'dblclick', function(e) {
        self.trigger('dblclick', e);
    });

    this.map.layers.bind('add', this._addLayer, this);
    this.map.layers.bind('remove', this._removeLayer, this);
    this.map.layers.bind('reset', this._addLayers, this);

    this.projector = new cdb.geo.CartoDBLayerGMaps.Projector(this.map_googlemaps);

    this.projector.draw = this._ready;

  },

  _ready: function() {
    this.projector.draw = function() {};
    this.trigger('ready');
    this._isReady = true;
  },

  _setScrollWheel: function(model, z) {
    this.map_googlemaps.setOptions({ scrollwheel: z });
  },

  _setZoom: function(model, z) {
    z = z || 0;
    this.map_googlemaps.setZoom(z);
  },

  _setCenter: function(model, center) {
    var c = new google.maps.LatLng(center[0], center[1]);
    this.map_googlemaps.setCenter(c);
  },

  createLayer: function(layer) {
    var layer_view,
        layerClass = this.layerTypeMap[layer.get('type').toLowerCase()];

    if (layerClass) {
      layer_view = new layerClass(layer, this.map_googlemaps);
    } else {
      cdb.log.error("MAP: " + layer.get('type') + " can't be created");
    }
    return layer_view;
  },

  _addLayer: function(layer, layers, opts) {
    opts = opts || {};
    var self = this;
    var lyr, layer_view;

    layer_view = this.createLayer(layer);

    if (!layer_view) {
      return;
    }

    this.layers[layer.cid] = layer_view;

    if (layer_view) {
      var idx = _.keys(this.layers).length  - 1;
      var isBaseLayer = idx === 0 || (opts && opts.index === 0);
      // set base layer
      if(isBaseLayer && !opts.no_base_layer) {
        var m = layer_view.model;
        if(m.get('type') == 'GMapsBase') {
          layer_view._update();
        } else {
          layer_view.isBase = true;
          layer_view._update();
        }
      } else {
        idx -= 1;
        idx = Math.max(0, idx); // avoid -1
        self.map_googlemaps.overlayMapTypes.setAt(idx, layer_view.gmapsLayer);
      }
      layer_view.index = idx;
      this.trigger('newLayerView', layer_view, this);
    } else {
      cdb.log.error("layer type not supported");
    }


    var attribution = layer.get('attribution');

    if (attribution) {
      // Setting attribution in map model
      // it doesn't persist in the backend, so this is needed.
      var attributions = this.map.get('attribution') || [];
      if (!_.contains(attributions, attribution)) {
        attributions.push(attribution);
      }

      this.map.set({ attribution: attributions });
    }

  },

  latLonToPixel: function(latlon) {
    return this.projector.latLngToPixel(new google.maps.LatLng(latlon[0], latlon[1]));
  },

  getSize: function() {
    return {
      x: this.$el.width(),
      y: this.$el.height()
    };
  },

  panBy: function(p) {
    var c = this.map.get('center');
    var pc = this.latLonToPixel(c);
    p.x += pc.x;
    p.y += pc.y;
    var ll = this.projector.pixelToLatLng(p);
    this.map.setCenter([ll.lat(), ll.lng()]);
  },

  getBounds: function() {
    if(this._isReady) {
      var b = this.map_googlemaps.getBounds();
      var sw = b.getSouthWest();
      var ne = b.getNorthEast();
      return [
        [sw.lat(), sw.lng()],
        [ne.lat(), ne.lng()]
      ];
    }
    return [ [0,0], [0,0] ];
  },

  setAttribution: function(m) {
    // Remove old one
    var old = document.getElementById("cartodb-gmaps-attribution")
      , attribution = m.get("attribution").join(", ");

    // If div already exists, remove it
    if (old) {
      old.parentNode.removeChild(old);
    }

    // Add new one
    var container           = this.map_googlemaps.getDiv()
      , cartodb_attribution = document.createElement("div");

    cartodb_attribution.setAttribute('id','cartodb-gmaps-attribution');
    cartodb_attribution.setAttribute('class', 'gmaps');
    container.appendChild(cartodb_attribution);
    cartodb_attribution.innerHTML = attribution;
  },

  setCursor: function(cursor) {
    this.map_googlemaps.setOptions({ draggableCursor: cursor });
  },

  _addGeomToMap: function(geom) {
    var geo = cdb.geo.GoogleMapsMapView.createGeometry(geom);
    if(geo.geom.length) {
      for(var i = 0 ; i < geo.geom.length; ++i) {
        geo.geom[i].setMap(this.map_googlemaps);
      }
    } else {
        geo.geom.setMap(this.map_googlemaps);
    }
    return geo;
  },

  _removeGeomFromMap: function(geo) {
    if(geo.geom.length) {
      for(var i = 0 ; i < geo.geom.length; ++i) {
        geo.geom[i].setMap(null);
      }
    } else {
      geo.geom.setMap(null);
    }
  },

  getNativeMap: function() {
    return this.map_googlemaps;
  },

  invalidateSize: function() {
    google.maps.event.trigger(this.map_googlemaps, 'resize');
  }

}, {

  /**
   * create the view for the geometry model
   */
  createGeometry: function(geometryModel) {
    if(geometryModel.isPoint()) {
      return new cdb.geo.gmaps.PointView(geometryModel);
    }
    return new cdb.geo.gmaps.PathView(geometryModel);
  }
});

}
/**
 * generic dialog
 *
 * this opens a dialog in the middle of the screen rendering
 * a dialog using cdb.templates 'common/dialog' or template_base option.
 *
 * inherit class should implement render_content (it could return another widget)
 *
 * usage example:
 *
 *    var MyDialog = cdb.ui.common.Dialog.extend({
 *      render_content: function() {
 *        return "my content";
 *      },
 *    })
 *    var dialog = new MyDialog({
 *        title: 'test',
 *        description: 'long description here',
 *        template_base: $('#base_template').html(),
 *        width: 500
 *    });
 *
 *    $('body').append(dialog.render().el);
 *    dialog.open();
 *
 * TODO: implement draggable
 * TODO: modal
 * TODO: document modal_type
 */

cdb.ui.common.Dialog = cdb.core.View.extend({

  tagName: 'div',
  className: 'dialog',

  events: {
    'click .ok': '_ok',
    'click .cancel': '_cancel',
    'click .close': '_cancel'
  },

  default_options: {
    title: 'title',
    description: '',
    ok_title: 'Ok',
    cancel_title: 'Cancel',
    width: 300,
    height: 200,
    clean_on_hide: false,
    enter_to_confirm: false,
    template_name: 'common/views/dialog_base',
    ok_button_classes: 'button green',
    cancel_button_classes: '',
    modal_type: '',
    modal_class: '',
    include_footer: true,
    additionalButtons: []
  },

  initialize: function() {
    _.defaults(this.options, this.default_options);

    _.bindAll(this, 'render', '_keydown');

    // Keydown bindings for the dialog
    $(document).bind('keydown', this._keydown);

    // After removing the dialog, cleaning other bindings
    this.bind("clean", this._reClean);

    this.template_base = this.options.template_base ? _.template(this.options.template_base) : cdb.templates.getTemplate(this.options.template_name);
  },

  render: function() {
    var $el = this.$el;

    $el.html(this.template_base(this.options));

    $el.find(".modal").css({
      width: this.options.width
      //height: this.options.height
      //'margin-left': -this.options.width>>1,
      //'margin-top': -this.options.height>>1
    });

    if(this.render_content) {

      this.$('.content').append(this.render_content());
    }

    if(this.options.modal_class) {
      this.$el.addClass(this.options.modal_class);
    }

    return this;
  },


  _keydown: function(e) {
    // If clicks esc, goodbye!
    if (e.keyCode === 27) {
      this._cancel();
    // If clicks enter, same as you click on ok button.
    } else if (e.keyCode === 13 && this.options.enter_to_confirm) {
      this._ok();
    }
  },

  /**
   * helper method that renders the dialog and appends it to body
   */
  appendToBody: function() {
    $('body').append(this.render().el);
    return this;
  },

  _ok: function(ev) {

   if(ev) ev.preventDefault();

    if (this.ok) {
      this.ok();
    }

    this.hide();

  },

  _cancel: function(ev) {

    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }

    if (this.cancel) {
      this.cancel();
    }

    this.hide();

  },

  hide: function() {

    this.$el.hide();

    if (this.options.clean_on_hide) {
      this.clean();
    }

  },

  open: function() {

    this.$el.show();

  },

  _reClean: function() {

    $(document).unbind('keydown', this._keydown);

  }

});
/**
 * generic embbed notification, like twitter "new notifications"
 *
 * it shows slowly the notification with a message and a close button.
 * Optionally you can set a timeout to close
 *
 * usage example:
 *
      var notification = new cdb.ui.common.Notificaiton({
          el: "#notification_element",
          msg: "error!",
          timeout: 1000
      });
      notification.show();
      // close it
      notification.close();
*/

cdb.ui.common.Notification = cdb.core.View.extend({

  tagName: 'div',
  className: 'dialog',

  events: {
    'click .close': 'hide'
  },

  default_options: {
      timeout: 0,
      msg: '',
      hideMethod: '',
      duration: 'normal'
  },

  initialize: function() {
    this.closeTimeout = -1;
    _.defaults(this.options, this.default_options);
    this.template = this.options.template ? _.template(this.options.template) : cdb.templates.getTemplate('common/notification');

    this.$el.hide();
  },

  render: function() {
    var $el = this.$el;
    $el.html(this.template(this.options));
    if(this.render_content) {
      this.$('.content').append(this.render_content());
    }
    return this;
  },

  hide: function(ev) {
    var self = this;
    if (ev)
      ev.preventDefault();
    clearTimeout(this.closeTimeout);
    if(this.options.hideMethod != '' && this.$el.is(":visible") ) {
      this.$el[this.options.hideMethod](this.options.duration, 'swing', function() {
        self.$el.html('');
        self.trigger('notificationDeleted');
        self.remove();
      });
    } else {
      this.$el.hide();
      self.$el.html('');
      self.trigger('notificationDeleted');
      self.remove();
    }

  },

  open: function(method, options) {
    this.render();
    this.$el.show(method, options);
    if(this.options.timeout) {
        this.closeTimeout = setTimeout(_.bind(this.hide, this), this.options.timeout);
    }
  }

});

/**
 * generic table
 *
 * this class creates a HTML table based on Table model (see below) and modify it based on model changes
 *
 * usage example:
 *
      var table = new Table({
          model: table
      });

      $('body').append(table.render().el);

  * model should be a collection of Rows

 */

/**
 * represents a table row
 */
cdb.ui.common.Row = cdb.core.Model.extend({
});

cdb.ui.common.TableData = Backbone.Collection.extend({
    model: cdb.ui.common.Row,
    fetched: false,

    initialize: function() {
      var self = this;
      this.bind('reset', function() {
        self.fetched = true;
      })
    },

    /**
     * get value for row index and columnName
     */
    getCell: function(index, columnName) {
      var r = this.at(index);
      if(!r) {
        return null;
      }
      return r.get(columnName);
    },

    isEmpty: function() {
      return this.length === 0;
    }

});

/**
 * contains information about the table, mainly the schema
 */
cdb.ui.common.TableProperties = cdb.core.Model.extend({

  columnNames: function() {
    return _.map(this.get('schema'), function(c) {
      return c[0];
    });
  },

  columnName: function(idx) {
    return this.columnNames()[idx];
  }
});

/**
 * renders a table row
 */
cdb.ui.common.RowView = cdb.core.View.extend({
  tagName: 'tr',

  initialize: function() {

    this.model.bind('change', this.render, this);
    this.model.bind('destroy', this.clean, this);
    this.model.bind('remove', this.clean, this);
    this.model.bind('change', this.triggerChange, this);
    this.model.bind('sync', this.triggerSync, this);
    this.model.bind('error', this.triggerError, this);

    this.add_related_model(this.model);
    this.order = this.options.order;
  },

  triggerChange: function() {
    this.trigger('changeRow');
  },

  triggerSync: function() {
    this.trigger('syncRow');
  },

  triggerError: function() {
    this.trigger('errorRow')
  },

  valueView: function(colName, value) {
    return value;
  },

  render: function() {
    var self = this;
    var row = this.model;

    var tr = '';

    var tdIndex = 0;
    var td;
    if(this.options.row_header) {
        td = '<td class="rowHeader" data-x="' + tdIndex + '">';
    } else {
        td = '<td class="EmptyRowHeader" data-x="' + tdIndex + '">';
    }
    var v = self.valueView('', '');
    if(v.html) {
      v = v[0].outerHTML;
    }
    td += v;
    td += '</td>';
    tdIndex++;
    tr += td

    var attrs = this.order || _.keys(row.attributes);
    var tds = '';
    var row_attrs = row.attributes;
    for(var i = 0, len = attrs.length; i < len; ++i) {
      var key = attrs[i];
      var value = row_attrs[key];
      if(value !== undefined) {
        var td = '<td id="cell_' + row.id + '_' + key + '" data-x="' + tdIndex + '">';
        var v = self.valueView(key, value);
        if(v.html) {
          v = v[0].outerHTML;
        }
        td += v;
        td += '</td>';
        tdIndex++;
        tds += td;
      }
    }
    tr += tds;
    this.$el.html(tr).attr('id', 'row_' + row.id);
    return this;
  },

  getCell: function(x) {
    var childNo = x;
    if(this.options.row_header) {
      ++x;
    }
    return this.$('td:eq(' + x + ')');
  },

  getTableView: function() {
    return this.tableView;
  }

});

/**
 * render a table
 * this widget needs two data sources
 * - the table model which contains information about the table (columns and so on). See TableProperties
 * - the model with the data itself (TableData)
 */
cdb.ui.common.Table = cdb.core.View.extend({

  tagName: 'table',
  rowView: cdb.ui.common.RowView,

  events: {
      'click td': '_cellClick',
      'dblclick td': '_cellDblClick'
  },

  default_options: {
  },

  initialize: function() {
    var self = this;
    _.defaults(this.options, this.default_options);
    this.dataModel = this.options.dataModel;
    this.rowViews = [];

    // binding
    this.setDataSource(this.dataModel);
    this.model.bind('change', this.render, this);
    this.model.bind('change:dataSource', this.setDataSource, this);

    // assert the rows are removed when table is removed
    this.bind('clean', this.clear_rows, this);

    // prepare for cleaning
    this.add_related_model(this.dataModel);
    this.add_related_model(this.model);

    // we need to use custom signals to make the tableview aware of a row being deleted,
    // because when you delete a point from the map view, sometimes it isn't on the dataModel
    // collection, so its destroy doesn't bubble throught there.
    // Also, the only non-custom way to acknowledge that a row has been correctly deleted from a server is with
    // a sync, that doesn't bubble through the table
    this.model.bind('removing:row', function() {
      self.rowsBeingDeleted = self.rowsBeingDeleted ? self.rowsBeingDeleted +1 : 1;
      self.rowDestroying();
    });
    this.model.bind('remove:row', function() {
      if(self.rowsBeingDeleted > 0) {
        self.rowsBeingDeleted--;
        self.rowDestroyed();
        if(self.dataModel.length == 0) {
          self.emptyTable();
        }
      }
    });

  },

  headerView: function(column) {
      return column[0];
  },

  setDataSource: function(dm) {
    if(this.dataModel) {
      this.dataModel.unbind(null, null, this);
    }
    this.dataModel = dm;
    this.dataModel.bind('reset', this._renderRows, this);
    this.dataModel.bind('add', this.addRow, this);
  },

  _renderHeader: function() {
    var self = this;
    var thead = $("<thead>");
    var tr = $("<tr>");
    if(this.options.row_header) {
      tr.append($("<th>").append(self.headerView(['', 'header'])));
    } else {
      tr.append($("<th>").append(self.headerView(['', 'header'])));
    }
    _(this.model.get('schema')).each(function(col) {
      tr.append($("<th>").append(self.headerView(col)));
    });
    thead.append(tr);
    return thead;
  },

  /**
   * remove all rows
   */
  clear_rows: function() {
    this.$('tfoot').remove();
    this.$('tr.noRows').remove();

    while(this.rowViews.length) {
      // each element removes itself from rowViews
      this.rowViews[0].clean();
    }
    this.rowViews = [];
  },

  /**
   * add rows
   */
  addRow: function(row, collection, options) {
    var self = this;
    var tr = new self.rowView({
      model: row,
      order: this.model.columnNames(),
      row_header: this.options.row_header
    });
    tr.tableView = this;

    tr.bind('clean', function() {
      var idx = _.indexOf(self.rowViews,this);
      self.rowViews.splice(idx, 1);
      // update index
      for(var i = idx; i < self.rowViews.length; ++i) {
        self.rowViews[i].$el.attr('data-y', i);
      }
    });
    tr.bind('changeRow', this.rowChanged, this);
    tr.bind('saved', this.rowSynched, this);
    tr.bind('errorRow', this.rowFailed, this);
    tr.bind('saving', this.rowSaving, this);
    this.retrigger('saving', tr);

    tr.render();
    if(options && options.index !== undefined && options.index != self.rowViews.length) {

      tr.$el.insertBefore(self.rowViews[options.index].$el);
      self.rowViews.splice(options.index, 0, tr);
      //tr.$el.attr('data-y', options.index);
      // change others view data-y attribute
      for(var i = options.index; i < self.rowViews.length; ++i) {
        self.rowViews[i].$el.attr('data-y', i);
      }
    } else {
      // at the end
      tr.$el.attr('data-y', self.rowViews.length);
      self.$el.append(tr.el);
      self.rowViews.push(tr);
    }

    this.trigger('createRow');
  },

  /**
  * Callback executed when a row change
  * @method rowChanged
  * @abstract
  */
  rowChanged: function() {},

  /**
  * Callback executed when a row is sync
  * @method rowSynched
  * @abstract
  */
  rowSynched: function() {},

  /**
  * Callback executed when a row fails to reach the server
  * @method rowFailed
  * @abstract
  */
  rowFailed: function() {},

  /**
  * Callback executed when a row send a POST to the server
  * @abstract
  */
  rowSaving: function() {},

  /**
  * Callback executed when a row is being destroyed
  * @method rowDestroyed
  * @abstract
  */
  rowDestroying: function() {},

  /**
  * Callback executed when a row gets destroyed
  * @method rowDestroyed
  * @abstract
  */
  rowDestroyed: function() {},

  /**
  * Callback executed when a row gets destroyed and the table data is empty
  * @method emptyTable
  * @abstract
  */
  emptyTable: function() {},

  /**
  * Checks if the table is empty
  * @method isEmptyTable
  * @returns boolean
  */
  isEmptyTable: function() {
    return (this.dataModel.length === 0 && this.dataModel.fetched)
  },

  /**
   * render only data rows
   */
  _renderRows: function() {
    this.clear_rows();
    if(! this.isEmptyTable()) {
      if(this.dataModel.fetched) {
        var self = this;

        this.dataModel.each(function(row) {
          self.addRow(row);
        });
      } else {
        this._renderLoading();
      }
    } else {
      this._renderEmpty();
    }

  },

  _renderLoading: function() {
  },

  _renderEmpty: function() {
  },

  /**
  * Method for the children to redefine with the table behaviour when it has no rows.
  * @method addEmptyTableInfo
  * @abstract
  */
  addEmptyTableInfo: function() {
    // #to be overwrite by descendant classes
  },

  /**
   * render table
   */
  render: function() {
    var self = this;

    // render header
    self.$el.html(self._renderHeader());

    // render data
    self._renderRows();

    return this;

  },

  /**
   * return jquery cell element of cell x,y
   */
  getCell: function(x, y) {
    if(this.options.row_header) {
      ++y;
    }
    return this.rowViews[y].getCell(x);
  },

  _cellClick: function(e, evtName) {
    evtName = evtName || 'cellClick';
    e.preventDefault();
    var cell = $(e.currentTarget || e.target);
    var x = parseInt(cell.attr('data-x'), 10);
    var y = parseInt(cell.parent().attr('data-y'), 10);
    this.trigger(evtName, e, cell, x, y);
  },

  _cellDblClick: function(e) {
    this._cellClick(e, 'cellDblClick');
  }


});
(function() {

var _requestCache = {};

/**
 * defines the container for an overlay.
 * It places the overlay
 */
var Overlay = {

  _types: {},

  // register a type to be created
  register: function(type, creatorFn) {
    Overlay._types[type] = creatorFn;
  },

  // create a type given the data
  // raise an exception if the type does not exist
  create: function(type, vis, data) {
    var t = Overlay._types[type];
    if(!t) {
      cdb.log.error("Overlay: " + type + " does not exist");
    }
    var widget = t(data, vis);
    widget.type = type;
    return widget;
  }
};

cdb.vis.Overlay = Overlay;

// layer factory
var Layers = {

  _types: {},

  register: function(type, creatorFn) {
    this._types[type] = creatorFn;
  },

  create: function(type, vis, data) {
    if(!type) {
      cdb.log.error("creating a layer without type");
      return null;
    }
    var t = this._types[type.toLowerCase()];

    var c = {};
    c.type = type;
    _.extend(c, data, data.options);
    return new t(vis, c);
  }

};

cdb.vis.Layers = Layers;

var Loader = cdb.vis.Loader = {

  queue: [],
  current: undefined,
  _script: null,
  head: null,

  get: function(url, callback) {
    if(!Loader._script) {
      Loader.current = callback;
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url + (~url.indexOf('?') ? '&' : '?') + 'callback=vizjson';
      script.async = true;
      Loader._script = script;
      if(!Loader.head) {
        Loader.head = document.getElementsByTagName('head')[0];
      }
      Loader.head.appendChild(script);
    } else {
      Loader.queue.push([url, callback]);
    }
  }

};

window.vizjson = function(data) {
  Loader.current && Loader.current(data);
  // remove script
  Loader.head.removeChild(Loader._script);
  Loader._script = null;
  // next element
  var a = Loader.queue.shift();
  if(a) {
    Loader.get(a[0], a[1]);
  }
};

/**
 * visulization creation
 */
var Vis = cdb.core.View.extend({

  initialize: function() {
    _.bindAll(this, 'loadingTiles', 'loadTiles');

    this.https = false;
    this.overlays = [];

    if(this.options.mapView) {
      this.mapView = this.options.mapView;
      this.map = this.mapView.map;
    }
  },


  load: function(data, options) {
    var self = this;
    if(typeof(data) === 'string') {
      var url = data;
      cdb.vis.Loader.get(url, function(data) {
        if(data) {
          self.load(data, options);
        } else {
          self.trigger('error', 'error fetching viz.json file');
        }
      });
      return this;
    }

    // configure the vis in http or https
    if(window && window.location.protocol && window.location.protocol === 'https:') {
      this.https = true;
    }

    if(data.https) {
      this.https = data.https;
    }

    var scrollwheel = true;
    
    options = options || {};

    this._applyOptions(data, options);
    this.cartodb_logo = options.cartodb_logo;
    scrollwheel       = options.scrollwheel;

    // map
    data.maxZoom || (data.maxZoom = 20);
    data.minZoom || (data.minZoom = 0);

    var mapConfig = {
      title: data.title,
      description: data.description,
      maxZoom: data.maxZoom,
      minZoom: data.minZoom,
      scrollwheel: scrollwheel,
      provider: data.map_provider
    };

    // if the boundaries are defined, we add them to the map
    if(data.bounding_box_sw && data.bounding_box_ne) {
      mapConfig.bounding_box_sw = data.bounding_box_sw;
      mapConfig.bounding_box_ne = data.bounding_box_ne;
    }
    if(data.bounds) {
      mapConfig.view_bounds_sw = data.bounds[0];
      mapConfig.view_bounds_ne = data.bounds[1];
    } else {
      var center = data.center;
      if (typeof(center) === "string") {
        center = $.parseJSON(center);
      }
      mapConfig.center = center || [0, 0];
      mapConfig.zoom = data.zoom == undefined ? 4: data.zoom;
    }

    var map = new cdb.geo.Map(mapConfig);
    this.map = map;
    this.updated_at = data.updated_at || new Date().getTime();

    var div = $('<div>').css({
      position: 'relative',
      width: '100%',
      height: '100%'
    });
    this.container = div;

    // Another div to prevent leaflet grabs the div
    var div_hack = $('<div>')
      .addClass("cartodb-map-wrapper")
      .css({
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%'
      });

    div.append(div_hack);
    this.$el.append(div);

    // Create the map
    var mapView = new cdb.geo.MapView.create(div_hack, map);
    this.mapView = mapView;

    // Add layers
    for(var i in data.layers) {
      var layerData = data.layers[i];
      this.loadLayer(layerData);
    }

    // Create the overlays
    for (var i in data.overlays) {
      this.addOverlay(data.overlays[i]);
    }

    _.defer(function() {
      self.trigger('done', self, self.getLayers());
    })

    return this;
  },

  addOverlay: function(overlay) {
    overlay.map = this.map;
    var v = Overlay.create(overlay.type, this, overlay);

    if (v) {
      // Save tiles loader view for later
      if (overlay.type == "loader") {
        this.loader = v;
      }

      this.addView(v);
      this.container.append(v.el);
      this.overlays.push(v);

      v.bind('clean', function() {
        for(var i in this.overlays) {
          var o = this.overlays[i];
          if(v.cid === o.cid) {
            this.overlays.splice(i, 1)
            return;
          }
        }
      }, this);

      // Set map position correctly taking into account
      // header height
      if (overlay.type == "header") {
        this.setMapPosition();
      }
    }
    return v;
  },

  // change vizjson based on options
  _applyOptions: function(vizjson, opt) {
    opt = opt || {};
    opt = _.defaults(opt, {
      search: false,
      title: false,
      description: false,
      tiles_loader: true,
      zoomControl: true,
      loaderControl: true,
      searchControl: false,
      infowindow: true
    });
    vizjson.overlays = vizjson.overlays || [];
    vizjson.layers = vizjson.layers || [];

    function search_overlay(name) {
      if(!vizjson.overlays) return null;
      for(var i = 0; i < vizjson.overlays.length; ++i) {
        if(vizjson.overlays[i].type === name) {
          return vizjson.overlays[i];
        }
      }
    }

    function remove_overlay(name) {
      if(!vizjson.overlays) return;
      for(var i = 0; i < vizjson.overlays.length; ++i) {
        if(vizjson.overlays[i].type === name) {
          vizjson.overlays.splice(i, 1);
          return;
        }
      }
    }

    this.infowindow = opt.infowindow;

    if(opt.https) {
      this.https = true;
    }

    // remove search if the vizualization does not contain it
    if (opt.search || opt.searchControl) {
      vizjson.overlays.push({
         type: "search"
      });
    }

    if(opt.title  || opt.description || opt.shareable) {
      vizjson.overlays.unshift({
        type: "header",
        shareable: opt.shareable ? true: false,
        url: vizjson.url
      });
    }

    if(!opt.title) {
      vizjson.title = null;
    }

    if(!opt.description) {
      vizjson.description = null;
    }

    if(!opt.tiles_loader) {
      remove_overlay('loader');
    }

    if(!opt.zoomControl) {
      remove_overlay('zoom');
    }

    if(!opt.loaderControl) {
      remove_overlay('loader');
    }

    // if bounds are present zoom and center will not taken into account
    if(opt.zoom !== undefined) {
      vizjson.zoom = parseFloat(opt.zoom);
      vizjson.bounds = null;
    }

    if(opt.center_lat !== undefined) {
      vizjson.center = [parseFloat(opt.center_lat), parseFloat(opt.center_lon)];
      vizjson.bounds = null;
    }

    if(opt.center !== undefined) {
      vizjson.center = opt.center;
      vizjson.bounds = null;
    }

    if(opt.sw_lat !== undefined) {
      vizjson.bounds = [
        [parseFloat(opt.sw_lat), parseFloat(opt.sw_lon)],
        [parseFloat(opt.ne_lat), parseFloat(opt.ne_lon)],
      ];
    }

    if(vizjson.layers.length > 1) {
      if(opt.sql) {
        vizjson.layers[1].options.query = opt.sql;
      }
      if(opt.style) {
        vizjson.layers[1].options.tile_style = opt.style;
      }

      vizjson.layers[1].options.no_cdn = opt.no_cdn;
    }

  },

  // Set map top position taking into account header height
  setMapPosition: function() {
    var header_h = this.$el.find(".cartodb-header:not(.cartodb-popup)").outerHeight();

    this.$el
      .find("div.cartodb-map-wrapper")
      .css("top", header_h);

    this.mapView.invalidateSize();
  },

  createLayer: function(layerData, opts) {
    var layerModel = Layers.create(layerData.type || layerData.kind, this, layerData);
    return this.mapView.createLayer(layerModel);
  },

  addInfowindow: function(layerView) {
    var model = layerView.model;
    var eventType = layerView.model.get('eventType') || 'featureClick';
    var infowindow = Overlay.create('infowindow', this, model.get('infowindow'), true);
    var mapView = this.mapView;
    mapView.addInfowindow(infowindow);

    var infowindowFields = layerView.model.get('infowindow');
    // HACK: REMOVE
    var port = model.get('sql_port');
    var domain = model.get('sql_domain') + (port ? ':' + port: '')
    var protocol = model.get('sql_protocol');
    var version = 'v1';
    if(domain.indexOf('cartodb.com') !== -1) {
      protocol = 'http';
      domain = "cartodb.com";
      version = 'v2';
    }

    var sql = new cartodb.SQL({
      user: model.get('user_name'),
      protocol: protocol,
      host: domain,
      version: version
    });

    // if the layer has no infowindow just pass the interaction
    // data to the infowindow
    layerView.bind(eventType, function(e, latlng, pos, data) {
        var cartodb_id = data.cartodb_id
        var fields = infowindowFields.fields;


        // Send request
        sql.execute("select {{fields}} from {{table_name}} where cartodb_id = {{cartodb_id }}", {
          fields: _.pluck(fields, 'name').join(','),
          cartodb_id: cartodb_id,
          table_name: model.get('table_name')
        })
        .done(function(interact_data) {
          if(interact_data.rows.length == 0 ) return;
          interact_data = interact_data.rows[0];
          if(infowindowFields) {
            var render_fields = [];
            var fields = infowindowFields.fields;
            for(var j = 0; j < fields.length; ++j) {
              var f = fields[j];
              if(interact_data[f.name] != undefined && interact_data[f.name] != "") {
                render_fields.push({
                  title: f.title ? f.name: null,
                  value: interact_data[f.name],
                  index: j ? j:null // mustache does not recognize 0 as false :(
                });
              }
            }
            // manage when there is no data to render
            if(render_fields.length === 0) {
              render_fields.push({
                title: null,
                value: 'No data available',
                index: j ? j:null, // mustache does not recognize 0 as false :(
                type: 'empty'
              });
            }
            content = render_fields;
          }

          infowindow.model.set({
            content:  {
              fields: content,
              data: interact_data
            }
          })
          infowindow.adjustPan();
        })
        .error(function() {
          infowindow.setError();
        })

        // Show infowindow with loading state
        infowindow
          .setLatLng(latlng)
          .setLoading()
          .showInfowindow();
    });

    layerView.bind('featureOver', function(e, latlon, pxPos, data) {
      mapView.setCursor('pointer');
    });
    layerView.bind('featureOut', function() {
      mapView.setCursor('auto');
    });

    layerView.infowindow = infowindow.model;
  },

  loadLayer: function(layerData, opts) {
    var map = this.map;
    var mapView = this.mapView;
    layerData.type = layerData.kind;
    var layer_cid = map.addLayer(Layers.create(layerData.type || layerData.kind, this, layerData), opts);

    var layerView = mapView.getLayerByCid(layer_cid);

    // add the associated overlays
    if(layerData.infowindow &&
      layerData.infowindow.fields &&
      layerData.infowindow.fields.length > 0 &&
      this.infowindow) {
      this.addInfowindow(layerView);
    }

    if (layerView) {
      layerView.bind('loading', this.loadingTiles);
      layerView.bind('load',    this.loadTiles);
    }

    return layerView;

  },

  loadingTiles: function() {
    if(this.loader) {
      this.loader.show()
    }
  },

  loadTiles: function() {
    if(this.loader) {
      this.loader.hide();
    }
  },

  error: function(fn) {
    return this.bind('error', fn);
  },

  done: function(fn) {
    return this.bind('done', fn);
  },

  // public methods
  //

  // get the native map used behind the scenes
  getNativeMap: function() {
    return this.mapView.getNativeMap();
  },

  // returns an array of layers
  getLayers: function() {
    var self = this;
    return this.map.layers.map(function(layer) {
      return self.mapView.getLayerByCid(layer.cid);
    });
  },

  getOverlays: function() {
    return this.overlays;
  },

  getOverlay: function(type) {
    return _(this.overlays).find(function(v) {
      return v.type == type;
    });
  }



});

cdb.vis.Vis = Vis;

})();

(function() {

// map zoom control
cdb.vis.Overlay.register('zoom', function(data) {

  var zoom = new cdb.geo.ui.Zoom({
    model: data.map,
    template: cdb.core.Template.compile(data.template)
  });

  return zoom.render();
});

// Tiles loader
cdb.vis.Overlay.register('loader', function(data) {

  var tilesLoader = new cdb.geo.ui.TilesLoader({
    template: cdb.core.Template.compile(data.template)
  });

  return tilesLoader.render();
});

// Header to show informtion (title and description)
cdb.vis.Overlay.register('header', function(data, vis) {
  var MAX_SHORT_DESCRIPTION_LENGTH = 100;

  // Add the complete url for facebook and twitter
  if (location.href) {
    data.share_url = encodeURIComponent(location.href);
  } else {
    data.share_url = data.url;
  }

  var template = cdb.core.Template.compile(
    data.template || "\
      {{#title}}<h1><a href='#' onmousedown=\"window.open('{{url}}')\">{{title}}</a></h1>{{/title}}\
      {{#description}}<p>{{description}}</p>{{/description}}\
      {{#shareable}}\
        <div class='social'>\
          <a class='facebook' target='_blank'\
            href='http://www.facebook.com/sharer.php?u={{share_url}}&text=Map of {{title}}: {{description}}'>F</a>\
          <a class='twitter' href='https://twitter.com/share?url={{share_url}}&text=Map of {{title}}: {{descriptionShort}}... '\
           target='_blank'>T</a>\
          </div>\
      {{/shareable}}\
    ",
    data.templateType || 'mustache'
  );

  var titleLength = data.map.get('title') ? data.map.get('title').length : 0;
  var descLength = data.map.get('description') ? data.map.get('description').length : 0;

  var maxDescriptionLength = MAX_SHORT_DESCRIPTION_LENGTH - titleLength;
  var description = data.map.get('description');
  var descriptionShort = description;

  if(descLength > maxDescriptionLength) {
    var descriptionShort = description.substr(0, maxDescriptionLength);
    // @todo (@johnhackworth): Improvement; Not sure if there's someway of doing thins with a regexp
    descriptionShort = descriptionShort.split(' ');
    descriptionShort.pop();
    descriptionShort = descriptionShort.join(' ');
  }

  var header = new cdb.geo.ui.Header({
    title: data.map.get('title'),
    description: description,
    descriptionShort: descriptionShort,
    url: data.url,
    share_url: data.share_url,
    shareable: (data.shareable == "false" || !data.shareable) ? null : data.shareable,
    template: template
  });

  return header.render();
});

// infowindow
cdb.vis.Overlay.register('infowindow', function(data, vis) {

  if (_.size(data.fields) == 0) {
    return null;
  }

  var infowindowModel = new cdb.geo.ui.InfowindowModel({
    fields: data.fields,
    template_name: data.template_name
  });

  var templateType = data.templateType || 'mustache';

  var infowindow = new cdb.geo.ui.Infowindow({
     model: infowindowModel,
     mapView: vis.mapView,
     template: new cdb.core.Template({ template: data.template, type: templateType}).asFunction()
  });

  return infowindow;
});


// search content
cdb.vis.Overlay.register('search', function(data, vis) {

  var template = cdb.core.Template.compile(
    data.template || '\
      <form>\
        <span class="loader"></span>\
        <input type="text" class="text" value="" />\
        <input type="submit" class="submit" value="" />\
      </form>\
    ',
    data.templateType || 'mustache'
  );

  var search = new cdb.geo.ui.Search({
    template: template,
    model: vis.map
  });

  return search.render();
});

// tooltip 
cdb.vis.Overlay.register('tooltip', function(data, vis) {
  var layer;
  var layers = vis.getLayers();
  if(layers.length > 1) {
    layer = layers[1];
  }
  data.layer = layer;
  var tooltip = new cdb.geo.ui.Tooltip(data);
  return tooltip;

});

cdb.vis.Overlay.register('infobox', function(data, vis) {
  var layer;
  var layers = vis.getLayers();
  if(layers.length > 1) {
    layer = layers[1];
  }
  data.layer = layer;
  var infobox = new cdb.geo.ui.InfoBox(data);
  return infobox;

});

})();

(function() {

var Layers = cdb.vis.Layers;

/*
 *  if we are using http and the tiles of base map need to be fetched from
 *  https try to fix it
 */

var HTTPS_TO_HTTP = {
  'https://dnv9my2eseobd.cloudfront.net/': 'http://a.tiles.mapbox.com/',
  'https://maps.nlp.nokia.com/': 'http://maps.nlp.nokia.com/',
  'https://tile.stamen.com/': 'http://tile.stamen.com/'
};

function transformToHTTP(tilesTemplate) {
  for(var url in HTTPS_TO_HTTP) {
    if(tilesTemplate.indexOf(url) !== -1) {
      return tilesTemplate.replace(url, HTTPS_TO_HTTP[url])
    }
  }
  return tilesTemplate;
}

Layers.register('tilejson', function(vis, data) {
  var url = data.tiles[0];
  url = vis.https ? url: transformToHTTP(url);
  return new cdb.geo.TileLayer({
    urlTemplate: url
  });
});

Layers.register('tiled', function(vis, data) {
  var url = data.urlTemplate;
  url = vis.https ? url: transformToHTTP(url);
  data.urlTemplate = url;
  return new cdb.geo.TileLayer(data);
});

Layers.register('gmapsbase', function(vis, data) {
  return new cdb.geo.GMapsBaseLayer(data);
});

Layers.register('plain', function(vis, data) {
  return new cdb.geo.PlainLayer(data);
});

Layers.register('background', function(vis, data) {
  return new cdb.geo.PlainLayer(data);
});

var cartoLayer = function(vis, data) {

  if(data.infowindow && data.infowindow.fields) {
    if(data.interactivity) {
      if(data.interactivity.indexOf('cartodb_id') === -1) {
        data.interactivity = data.interactivity + ",cartodb_id"
      }
    } else {
      data.interactivity = 'cartodb_id';
    }
  }

  data.tiler_protocol = vis.https ? 'https': 'http';
  if(!data.no_cdn) {
    data.tiler_protocol = vis.https ? 'https': 'http';
    data.tiler_port = vis.https ? 443: 80;
  }
  data.extra_params = data.extra_params || {};
  if(vis.updated_at) {
    // see #1724 (internal)
    data.extra_params.cache_buster = vis.updated_at;
    //delete data.extra_params.cache_buster;
  } else {
    data.no_cdn = true;
  }
  data.cartodb_logo = vis.cartodb_logo;

  return new cdb.geo.CartoDBLayer(data);
};

Layers.register('cartodb', cartoLayer);
Layers.register('carto', cartoLayer);

})();
/**
 * public api for cartodb
 */

(function() {


  function _Promise() {

  }
  _.extend(_Promise.prototype,  Backbone.Events, {
    done: function(fn) {
      return this.bind('done', fn);
    }, 
    error: function(fn) {
      return this.bind('error', fn);
    }
  });

  cdb._Promise = _Promise;

  var _requestCache = {};

  /**
   * compose cartodb url
   */
  function cartodbUrl(opts) {
    var host = opts.host || 'cartodb.com';
    var protocol = opts.protocol || 'https';
    return protocol + '://' + opts.user + '.' + host + '/api/v1/viz/' + opts.table + '/viz.json';
  }

  /**
   * given layer params fetchs the layer json
   */
  function _getLayerJson(layer, callback) {
    var url = null;
    if(layer.layers !== undefined || ((layer.kind || layer.type) !== undefined && layer.options !== undefined)) {
      // layer object contains the layer data
      _.defer(function() { callback(layer); });
      return;
    } else if(layer.table !== undefined && layer.user !== undefined) {
      // layer object points to cartodbjson
      url = cartodbUrl(layer);
    } else if(layer.indexOf && layer.indexOf('http') === 0) {
      // fetch from url
      url = layer;
    }
    if(url) {
      cdb.vis.Loader.get(url, callback);
    } else {
      _.defer(function() { callback(null); });
    }
  }

  /**
   * create a layer for the specified map
   * 
   * @param map should be a L.Map or google.maps.Map object
   * @param layer should be an url or a javascript object with the data to create the layer
   * @param options layer options
   *
   */

  cartodb.createLayer = function(map, layer, options, callback) {

    var promise = new _Promise();
    var layerView, MapType;
    if(map === undefined) {
      throw new TypeError("map should be provided");
    }
    if(layer === undefined) {
      throw new TypeError("layer should be provided");
    }
    var args = arguments,
    fn = args[args.length -1];
    if(_.isFunction(fn)) {
      callback = fn;
    }
    
    _getLayerJson(layer, function(visData) {

      var layerData, MapType;

      if(!visData) {
        promise.trigger('error');
        return;
      }
      // extract layer data from visualization data
      if(visData.layers) {
        if(visData.layers.length < 2) {
          promise.trigger('error', "visualization file does not contain layer info");
        }
        layerData = visData.layers[1];
        // add the timestamp to options
        layerData.options.extra_params = layerData.options.extra_params || {};
        //layerData.options.extra_params.updated_at = visData.updated_at;
        layerData.options.extra_params.cache_buster = visData.updated_at;
        //delete layerData.options.cache_buster;
      } else {
        layerData = visData;
      }

      if(!layerData) {
        promise.trigger('error');
        return;
      }

      // check map type
      // TODO: improve checking
      if(typeof(map.overlayMapTypes) !== "undefined") {
        MapType = cdb.geo.GoogleMapsMapView;
        // check if leaflet is loaded globally
      } else if(map instanceof L.Map || (window.L && map instanceof window.L.Map)) {
        MapType = cdb.geo.LeafletMapView;
      } else {
        promise.trigger('error', "cartodb.js can't guess the map type");
        return;
      }

      // update options
      if(options && !_.isFunction(options)) {
        _.extend(layerData.options, options);
      } 

      options = options || {};
      options = _.defaults(options, {
          infowindow: true
      })

      // create a dummy viz
      var viz = map.viz;
      if(!viz) {
        var mapView = new MapType({
          map_object: map,
          map: new cdb.geo.Map()
        });

        map.viz = viz = new cdb.vis.Vis({
          mapView: mapView
        });

        viz.updated_at = visData.updated_at;
      }

      layerView = viz.createLayer(layerData, { no_base_layer: true });
      if(options.infowindow && layerView.model.get('infowindow') && layerView.model.get('infowindow').fields.length > 0) {
        viz.addInfowindow(layerView);
      }
      callback && callback(layerView);
      promise.trigger('done', layerView);
    });

    return promise;

  };


})();
(function() {

  var root = this;

  function SQL(options) {
    if(cdb === this || window === this) {
      return new SQL(options);
    }
    if(!options.user) {
      throw new Error("user should be provided");
    }
    var loc = new String(window.location.protocol);
    loc = loc.slice(0, loc.length - 1);
    if(loc == 'file') {
      loc = 'https';
    }

    this.options = _.defaults(options, {
      version: 'v2',
      protocol: loc,
      jsonp: !$.support.cors
    })
  }

  SQL.prototype._host = function() {
    var opts = this.options;
    if(opts && opts.completeDomain) {
      return opts.completeDomain + '/api/' +  opts.version + '/sql'
    } else {
      var host = opts.host || 'cartodb.com';
      var protocol = opts.protocol || 'https';

      return protocol + '://' + opts.user + '.' + host + '/api/' +  opts.version + '/sql';
    }
  }

  /**
   * var sql = new SQL('cartodb_username');
   * sql.execute("select * form {table} where id = {id}", {
   *    table: 'test',
   *    id: '1'
   * })
   */
  SQL.prototype.execute= function(sql, vars, options, callback) {
    var promise = new cdb._Promise();
    if(!sql) {
      throw new TypeError("sql should not be null");
    }
    // setup arguments
    var args = arguments,
    fn = args[args.length -1];
    if(_.isFunction(fn)) {
      callback = fn;
    }
    options = _.defaults(options || {}, this.options);
    var params = {
      type: 'get',
      dataType: 'json',
      crossDomain: true
    };

    if(options.jsonp) {
      delete params.crossDomain;
      params.dataType = 'jsonp';
    }

    // create query
    var query = Mustache.render(sql, vars);
    var q = 'q=' + encodeURIComponent(query);

    // request params
    var reqParams = ['format', 'dp', 'api_key'];
    for(var i in reqParams) {
      var r = reqParams[i];
      var v = options[r];
      if(v) {
        q += '&' + r + "=" + v;
      }
    }

    var isGetRequest = options.type == 'get' || params.type == 'get';
    // generate url depending on the http method
    params.url = this._host() ;
    if(isGetRequest) {
      params.url += '?' + q
    } else {
      params.data = q;
    }

    // wrap success and error functions
    var success = options.success;
    var error = options.error;
    if(success) delete options.success;
    if(error) delete error.success;

    params.error = function(resp) {
      var errors = resp.responseText && JSON.parse(resp.responseText);
      promise.trigger('error', errors && errors.error, resp)
      if(error) error(resp);
    }
    params.success = function(resp, status, xhr) {
      promise.trigger('done', resp, status, xhr);
      if(success) success(resp, status, xhr);
      if(callback) callback(resp);
    }

    // call ajax
    delete options.jsonp;
    $.ajax(_.extend(params, options));
    return promise;
  }

  SQL.prototype.getBounds = function(sql, vars, options, callback) {
      var promise = new cdb._Promise();
      var args = arguments,
      fn = args[args.length -1];
      if(_.isFunction(fn)) {
        callback = fn;
      }
      var s = 'SELECT ST_XMin(ST_Extent(the_geom)) as minx,' +
              '       ST_YMin(ST_Extent(the_geom)) as miny,'+
              '       ST_XMax(ST_Extent(the_geom)) as maxx,' +
              '       ST_YMax(ST_Extent(the_geom)) as maxy' +
              ' from ({{{ sql }}}) as subq';
      sql = Mustache.render(sql, vars);
      this.execute(s, { sql: sql }, options)
        .done(function(result) {
          if (result.rows && result.rows.length > 0 && result.rows[0].maxx != null) {
            var c = result.rows[0];
            var minlat = -85.0511;
            var maxlat =  85.0511;
            var minlon = -179;
            var maxlon =  179;

            var clamp = function(x, min, max) {
              return x < min ? min : x > max ? max : x;
            }

            var lon0 = clamp(c.maxx, minlon, maxlon);
            var lon1 = clamp(c.minx, minlon, maxlon);
            var lat0 = clamp(c.maxy, minlat, maxlat);
            var lat1 = clamp(c.miny, minlat, maxlat);

            var bounds = [[lat0, lon0], [lat1, lon1]];
            promise.trigger('done', bounds);
            callback && callback(bounds);
          }
        })
        .error(function(err) {
          promise.trigger('error', err);
        })

      return promise;

  }

  /**
   * var people_under_10 = sql
   *    .table('test')
   *    .columns(['age', 'column2'])
   *    .filter('age < 10')
   *    .limit(15)
   *    .order_by('age')
   *
   *  people_under_10(function(results) {
   *  })
   */

  SQL.prototype.table = function(name) {

    var _name = name;
    var _filters;
    var _columns = [];
    var _limit;
    var _order;
    var _orderDir;
    var _sql = this;

    function _table(callback) {
      _table.fetch(callback);
    }

    _table.fetch = function(callback) {
      _sql.execute(_table.sql(), {}, callback);
    }

    _table.sql = function() {
      var s = "select"
      if(_columns.length) {
        s += ' ' + _columns.join(',') + ' '
      } else {
        s += ' * '
      }
      
      s += "from " + _name;

      if(_filters) {
        s += " where " + _filters;
      }
      if(_limit) {
        s += " limit " + _limit;
      }
      if(_order) {
        s += " order by " + _order;
      }
      if(_orderDir) {
        s += ' ' + _orderDir;
      }

      return s;
    }

    _table.filter = function(f) {
      _filters = f;
      return _table;
    }

    _table.order_by= function(o) {
      _order = o;
      return _table;
    }
    _table.asc = function() {
      _orderDir = 'asc'
      return _table;
    }

    _table.desc = function() {
      _orderDir = 'desc'
      return _table;
    }

    _table.columns = function(c) {
      _columns = c;
      return _table;
    }

    _table.limit = function(l) {
      _limit = l;
      return _table;
    }

    return _table;

  }

  cartodb.SQL = SQL;

})();
(function() {

  cartodb.createVis = function(el, vizjson, options, callback) {
    if(!el) {
      throw new TypeError("an dom element should be provided");
    }
    var args = arguments,
    fn = args[args.length -1];
    if(_.isFunction(fn)) {
      callback = fn;
    }
    el = (typeof el === 'string' ? document.getElementById(el) : el);
    var vis = new cartodb.vis.Vis({ el: el });
    if(vizjson) {
      vis.load(vizjson, options);
      if(callback) {
        vis.done(callback);
      }
    }
    return vis;
  };

})();


    cdb.$ = $;
    cdb.L = L;
    cdb.Mustache = Mustache;
    cdb.Backbone = Backbone;
    cdb._ = _;

  })();




  ;
  for(var i in __prev) {
    // keep it at global context if it didn't exist
    if(__prev[i]) {
      window[i] = __prev[i];
    }
  }


})();
