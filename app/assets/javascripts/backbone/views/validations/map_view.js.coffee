class BlueCarbon.Views.Validations.MapView extends Backbone.View
  initialize: (options) ->
    @map = L.map('map',
      center: [24.5,54]
      zoom: 9
    )

    tileLayerUrl = 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png'
    tileLayer = new L.TileLayer(tileLayerUrl, {maxZoom: 18}).addTo(@map)

    @map.on 'draw:poly-created', (e) =>
      @model.setCoordsFromPoints(e.poly.getLatLngs())
      polygon = L.polygon(@model.coordsAsLatLngArray())
      polygon.addTo(@map)

    BlueCarbon.Map = @map
