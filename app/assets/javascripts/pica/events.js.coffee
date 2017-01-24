window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Events
  on: (event, callback) ->
    @events ||= {}
    @events[event] ||= []
    @events[event].push callback

  off: (event, callback) ->
    return unless @events?

    if event?
      if @events[event]?
        if callback?
          for eventCallback, index in @events[event]
            if eventCallback == callback
              @events[event].splice(index, 1)
              index -= 1
        else
          delete @events[event]
    else
      @events = []

  trigger: (event, args) ->
    if @events? && @events[event]?
      for callback in @events[event]
        callback.apply(@, [].concat(args))

