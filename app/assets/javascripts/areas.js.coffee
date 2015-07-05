# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

$ ->
  if $('#map').length > 0
    map = new Map('map', country: $('#map').data('country-iso')).map
    addDraw(map)

addDraw = (map) ->
  drawnItems = new L.LayerGroup()

  if findAreaCoordinates()
    initialRectangle = new L.polygon(findAreaCoordinates())
    drawnItems.addLayer(initialRectangle)
    map.fitBounds(initialRectangle.getBounds())

  editableMap(map, drawnItems) if $('#area_coordinates').length > 0

  map.addLayer(drawnItems)

editableMap = (map, drawnItems) ->
  @map = map
  @drawControl = new L.Control.Draw
    polyline: false
    circle: false
    marker: false
    rectangle: false
  map.addControl(@drawControl)

  map.on 'draw:poly-created', (e) =>
    polygon = e.poly

    points = for point in polygon.getLatLngs()
      [point.lng, point.lat]
    points.push points[0]

    # Check if polygon self intersects
    format = new OpenLayers.Format.WKT()
    op_poly = format.read("POLYGON(#{ _.map(points, (point) -> "#{point[0]} #{point[1]}").join(',') })")

    if checkSelfIntersection(op_poly.geometry)
      alert("Invalid self intersecting polygon detected...")
      return false

    $('#area_coordinates').val(JSON.stringify(points))

    drawnItems.addLayer(polygon)

    # Remove the current polygon from the map when the drawing tool is
    # reenabled
    map.on 'drawing', (e) =>
      drawnItems.removeLayer(polygon)

findAreaCoordinates = ->
  if window.areaCoordinates?
    return _.map(window.areaCoordinates, (arr) -> [arr[1], arr[0]])

  try
    if $('#area_coordinates').length > 0
      coordinates = JSON.parse($('#area_coordinates').val())
      return _.map(coordinates, (arr) -> [arr[1], arr[0]])
  false
