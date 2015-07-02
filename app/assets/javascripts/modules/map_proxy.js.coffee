window.MapProxy = class MapProxy
  @newMap: (opts, next) ->
    $.post('/proxy/maps', opts, (data, statusCode, responseObj) ->
      if responseObj.status == 201
        next(null, responseObj.getResponseHeader('Location'))
      else
        next(new Error("The proxy didn't create a map"))
    )
