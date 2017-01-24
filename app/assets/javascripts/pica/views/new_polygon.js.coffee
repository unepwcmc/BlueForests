window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Views.NewPolygonView
  constructor: (options) ->
    if options.callbacks?
      @successCallback = options.callbacks.success
      @errorCallback = options.callbacks.error

    @polygon = options.polygon

    # Turn on Leaflet.draw polygon tool
    @polygonDraw = new L.Draw.Polygon(Pica.config.map, {})
    @polygonDraw.enable()

    Pica.config.map.on L.Draw.Event.CREATED, (e) =>
      mapPolygon = e.layer
      @createPolygon mapPolygon

  createPolygon: (mapPolygon) ->
    @polygon.setGeomFromPoints(mapPolygon.getLatLngs()[0])
    @polygon.save(
      success: () =>
        @close()
        @successCallback() if @successCallback?
      error: (xhr, textStatus, errorThrown) =>
        @close()
        @errorCallback.apply(@, arguments) if @errorCallback?
    )

  close: () ->
    @polygonDraw.disable()
    Pica.config.map.off(L.Draw.Event.CREATED)
