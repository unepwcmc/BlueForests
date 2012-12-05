BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.MapView extends Backbone.View
  initialize: (options) ->
    @map = L.map('map',
      center: [24.5,54]
      zoom: 9
    )

    tileLayerUrl = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png';
    tileLayer = new L.TileLayer(tileLayerUrl, {maxZoom: 18}).addTo(@map)

    drawControl = new L.Control.Draw(
      polyline: false
      circle: false
      rectangle: false
      marker: false
    )
    @map.addControl(drawControl)

    @map.on 'draw:poly-created', (e) =>
      @model.setCoordsFromPoints(e.poly.getLatLngs())

    @render_polygons()

  render_polygons: () ->

class BlueCarbon.Views.Validations.ShowView extends Backbone.View
  template: JST["backbone/templates/validations/edit"]

  events:
    "submit #edit-validation" : "update"

  update: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"
    )

  render: ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
