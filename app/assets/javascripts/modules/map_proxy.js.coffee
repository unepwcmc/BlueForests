window.MapProxy = class MapProxy
  @newMap: (opts, next) ->
    $.post('/proxy/maps', opts, (data, statusCode, responseObj) ->
      next(new Error("The proxy didn't create a map")) if responseObj == 201
      next(null, responseObj.getResponseHeader('Location'))
    )
