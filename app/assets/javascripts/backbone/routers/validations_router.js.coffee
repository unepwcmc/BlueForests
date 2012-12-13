class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @validations.reset options.validations

    @areas = new BlueCarbon.Collections.AreasCollection()
    @areas.reset options.areas

  routes:
    "new"      : "newValidation"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newValidation: ->
    @view = new BlueCarbon.Views.Validations.NewView(collection: @validations, areas: @areas)
    $("#validations").html(@view.render().el)

    # Map
    @initializeMap('map', @findCoordinates())

  index: ->
    @view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    $("#validations").html(@view.render().el)

  show: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.ShowView(model: validation)
    $("#validations").html(@view.render().el)

    # Map
    @initializeMap('map', JSON.parse(validation.get('coordinates')))

  edit: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.EditView(model: validation, areas: @areas)
    $("#validations").html(@view.render().el)

    # Map
    @initializeMap('map', @findCoordinates())

  initializeMap: (map_id, coordinates) ->
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
      'Mangroves': L.tileLayer('https://carbon-tool.cartodb.com/tiles/country_boundaries/{z}/{x}/{y}.png?sql=SELECT * FROM algalmat').addTo(map)
      'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/country_boundaries/{z}/{x}/{y}.png?sql=SELECT * FROM algalmat').addTo(map)

    L.control.layers(baseMaps, overlayMaps).addTo(map)

    drawnItems = new L.LayerGroup()

    if coordinates
      initialPolygon = new L.polygon(coordinates)
      drawnItems.addLayer(initialPolygon)

    @editableMap(map, drawnItems) if $('#coordinates').length > 0

    map.addLayer(drawnItems)

  editableMap: (map, drawnItems) ->
    drawControl = new L.Control.Draw
      polyline: false
      circle: false
      marker: false
      rectangle: false
    map.addControl(drawControl)

    map.on 'draw:poly-created', (e) =>
      latLngs = e.poly.getLatLngs()

      $('#coordinates').val(@latLngsToString(e.poly.getLatLngs())).trigger('change')
      drawnItems.addLayer(e.poly)

  findCoordinates: ->
    try
      return JSON.parse($('#coordinates').val()) if $('#coordinates').length > 0
    false

  latLngsToString: (latLngs) ->
    "[#{_.map(latLngs, (ll) -> "[#{ll.lat},#{ll.lng}]")}]"
