$(document).ready ->
  initializeMap('map') if $('#map').length > 0

initializeMap = (map_id) ->
  baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 17})
  baseSatellite = new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "Aerial", maxZoom: 19})

  map = L.map map_id,
    center: [24.5, 54]
    zoom: 9
    minZoom: 8
    maxZoom: 19
    layers: [baseSatellite]

  # Layers
  baseMaps =
    'Map': baseMap
    'Satellite': baseSatellite

  habitats = ['Mangrove', 'Seagrass', 'Sabkha', 'Saltmarsh', 'Algal Mat', 'Other']

  habitatOverlay = (habitat) ->
    "/proxy/#{habitat}/{z}/{x}/{y}.png?where=toggle = true AND (action <> 'delete' OR action IS NULL)"


  overlayMaps = habitats.reduce( (total, habitat) ->
    overlay = habitatOverlay(habitat)

    total[habitat] = L.tileLayer(overlay).addTo(map)
    total
  , {})

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
