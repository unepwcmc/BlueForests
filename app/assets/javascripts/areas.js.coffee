# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

$ ->
  initializeMap('map') if $('#map').length > 0

initializeMap = (map_id) ->
  map = L.map(map_id).setView([51.505, -0.09], 8)
  L.tileLayer 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png'
    maxZoom: 18
  .addTo(map)

  drawnItems = new L.LayerGroup()

  if findAreaCoordinates()
    initialRectangle = new L.rectangle(findAreaCoordinates())
    drawnItems.addLayer(initialRectangle)

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
  return JSON.parse($('#area_coordinates').val()) if $('#area_coordinates').length > 0

  return false
