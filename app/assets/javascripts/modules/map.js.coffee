window.Map = class Map
  HABITATS =
    mangrove: '#008b00'
    seagrass: '#9b1dea'
    saltmarsh: '#007dff'
    algal_mat: '#ffe048'
    other: '#1dcbea'

  constructor: (elementId, mapOpts={}) ->
    @baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 17})
    @baseSatellite =  new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "Aerial", maxZoom: 19})

    @initializeMap(elementId, mapOpts)
    @addAttribution()
    @addOverlays(mapOpts.countryIso, (err, overlays) =>
      L.control.layers(@baseMaps, overlays).addTo(@map)
    )

  initializeMap: (elementId, mapOpts) ->
    mapOpts.maxBounds = L.latLngBounds(mapOpts.bounds)
    mapOpts.center = mapOpts.maxBounds.getCenter()
    mapOpts.layers = [@baseSatellite]

    @map = L.map(elementId, mapOpts)
    @map.fitBounds(mapOpts.maxBounds)

  addAttribution: ->
    attribution = L.control.attribution(position: 'bottomright', prefix: '')
    attribution.addTo(@map)

  baseMaps: ->
    baseMaps = {}
    baseMaps[polyglot.t('analysis.map')] = @baseMap
    baseMaps[polyglot.t('analysis.satellite')] = @baseSatellite

  addOverlays: (countryIso, done) ->
    async.reduce(@getSublayers(), {}, (sublayers, sublayer, cb) =>
      sublayer.country_iso = countryIso

      MapProxy.newMap(sublayer, (err, tilesUrl) =>
        tilesUrl = decodeURIComponent(tilesUrl)
        prettyName = polyglot.t("analysis.#{sublayer.habitat}")

        sublayers[prettyName] = L.tileLayer(tilesUrl).addTo(@map)
        cb(null, sublayers)
      )
    , done)

  getSublayers: ->
    _.map(HABITATS, (polygon_fill, habitat) ->
      where = "toggle = true AND (action <> 'delete' OR action IS NULL)"
      style = """
        #bc_#{habitat} {
          line-color: #FFF;
          line-width: 0.5;
          polygon-fill: #{polygon_fill};
          polygon-opacity: 0.4
        }
      """

      {habitat: habitat, where: where, style: style}
    )
