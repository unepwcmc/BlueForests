window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Views.ShowAreaPolygonsView extends Pica.Events
  constructor: (options) ->
    @area = options.area
    @polysObserved = []
    @mapPolygons = []
    @area.on('sync', @render)
    @area.on('addedPolygon', @addPolygon)
    @render()

  render: =>
    @removeAllPolygonsAndBindings()

    for polygon in @area.polygons
      continue unless polygon.isComplete()

      # Method which emulates calling 'new theConstructor.apply(@, args)'
      newObject = (theConstructor, args)->
        Wrapper = (args) ->
          return theConstructor.apply(@, args)
        Wrapper:: = theConstructor::
        return new Wrapper(args)
      mapPolygon = newObject(L[polygon.get('geometry').type],
        polygon.asLeafletArguments()).addTo(Pica.config.map)

      polygon.on('delete', (=>
        thatMapPolygon = mapPolygon
        return =>
          @removeMapPolygonAndBindings(thatMapPolygon)
      )())

      mapPolygon.on('click', (=>
        thatPolygon = polygon
        thatMapPolygon = mapPolygon
        return (event) =>
          @triggerPolyClick(thatPolygon, event, thatMapPolygon)
      )())

      @mapPolygons.push(mapPolygon)

  addPolygon: (polygon) =>
    polygon.on('change', @render)
    @polysObserved.push(polygon)

  close: ->
    @removeAllPolygonsAndBindings()
    @area.off('sync', @render)
    @area.off('addedPolygon', @addPolygon)
    for polygon in @polysObserved
      polygon.off('change', @render)

  removeAllPolygonsAndBindings: ->
    while mapPolygon = @mapPolygons.shift()
      @removeMapPolygonAndBindings(mapPolygon)

  removeMapPolygonAndBindings: (mapPolygon) ->
    mapPolygon.off('click', @triggerPolyClicked)
    Pica.config.map.removeLayer mapPolygon

  triggerPolyClick: (polygon, event, mapPolygon) =>
    @trigger('polygonClick', [polygon, event, mapPolygon])
