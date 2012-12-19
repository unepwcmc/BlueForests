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
    'Mangroves': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_mangrove/{z}/{x}/{y}.png?sql=SELECT * FROM bc_mangrove WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_seagrass/{z}/{x}/{y}.png?sql=SELECT * FROM bc_seagrass WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Sabkha': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_sabkha/{z}/{x}/{y}.png?sql=SELECT * FROM bc_sabkha WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Salt marshes': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_salt_marsh/{z}/{x}/{y}.png?sql=SELECT * FROM bc_salt_marsh WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)

  L.control.layers(baseMaps, overlayMaps).addTo(map)

  drawnItems = new L.LayerGroup()

  if findAreaCoordinates()
    initialRectangle = new L.rectangle(findAreaCoordinates())
    drawnItems.addLayer(initialRectangle)
    map.fitBounds(initialRectangle.getBounds())

  editableMap(map, drawnItems) if $('#area_coordinates').length > 0

  map.addLayer(drawnItems)

editableMap = (map, drawnItems) ->
  drawControl = new L.Control.Draw
    polyline: false
    polygon: false
    circle: false
    marker: false
  map.addControl(drawControl)

  map.on 'draw:rectangle-created', (e) ->
    rectangle = [[180, 90], [-180, -90]]

    for latLng in e.rect.getLatLngs()
      rectangle[0][0] = (latLng.lat % 180) if (latLng.lat % 180) < rectangle[0][0]
      rectangle[0][1] = (latLng.lng % 90) if (latLng.lng % 90) < rectangle[0][1]
      rectangle[1][0] = (latLng.lat % 180) if (latLng.lat % 180) > rectangle[1][0]
      rectangle[1][1] = (latLng.lng % 90) if (latLng.lng % 90) > rectangle[1][1]

    $('#area_coordinates').val("[[#{rectangle[0][0]},#{rectangle[0][1]}],[#{rectangle[1][0]},#{rectangle[1][1]}]]")
    drawnItems.addLayer(e.rect)

findAreaCoordinates = ->
  return window.areaCoordinates if window.areaCoordinates?

  try
    return JSON.parse($('#area_coordinates').val()) if $('#area_coordinates').length > 0
  false
