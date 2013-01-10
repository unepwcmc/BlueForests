# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

$ ->
  initializeMap('map') if $('#map').length > 0

initializeMap = (map_id) ->
  baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 18})
  baseSatellite = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', {maxZoom: 18})

  map = L.map map_id,
    center: [24.5, 54]
    zoom: 9
    layers: [baseSatellite]

  # Layers
  baseMaps =
    'Map': baseMap
    'Satellite': baseSatellite

  overlayMaps =
    'Mangrove': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_mangrove/{z}/{x}/{y}.png?sql=SELECT * FROM bc_mangrove WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_seagrass/{z}/{x}/{y}.png?sql=SELECT * FROM bc_seagrass WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Sabkha': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_sabkha/{z}/{x}/{y}.png?sql=SELECT * FROM bc_sabkha WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Saltmarsh': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_saltmarsh/{z}/{x}/{y}.png?sql=SELECT * FROM bc_saltmarsh WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Algal Mat': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_algal_mat/{z}/{x}/{y}.png?sql=SELECT * FROM bc_algal_mat WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Other': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_other/{z}/{x}/{y}.png?sql=SELECT * FROM bc_other WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)

  L.control.layers(baseMaps, overlayMaps).addTo(map)

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
