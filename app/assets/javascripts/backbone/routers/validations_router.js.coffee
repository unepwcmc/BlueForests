class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @validations.reset options.validations

  routes:
    "new"      : "newValidation"
    "index"    : "index"
    ":id/edit" : "edit"
    ":id"      : "show"
    ".*"        : "index"

  newValidation: ->
    @view = new BlueCarbon.Views.Validations.NewView(collection: @validations)
    $("#validations").html(@view.render().el)

    # Map
    @initializeMap('map')

  index: ->
    @view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    $("#validations").html(@view.render().el)

  show: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.ShowView(model: validation)
    $("#validations").html(@view.render().el)

  edit: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.EditView(model: validation)
    $("#validations").html(@view.render().el)

    # Map
    @initializeMap('map')

  initializeMap: (map_id) ->
    map = L.map(map_id).setView([24.5, 54], 9)
    L.tileLayer 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png'
      maxZoom: 18
    .addTo(map)

    drawnItems = new L.LayerGroup()

    if @findCoordinates()
      initialPolygon = new L.polygon(@findCoordinates())
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
    return window.validationCoordinates if window.validationCoordinates?

    try
      return JSON.parse($('#coordinates').val()) if $('#coordinates').length > 0
    false

  latLngsToString: (latLngs) ->
    "[#{_.map(latLngs, (ll) -> "[#{ll.lat},#{ll.lng}]")}]"
