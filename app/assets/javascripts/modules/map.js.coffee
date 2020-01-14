window.Map = class Map
  HABITATS =
    mangrove:
      color: '#008b00'
      name: 'Mangrove'
    seagrass:
      color: '#9b1dea'
      name: 'Seagrass'
    saltmarsh:
      color: '#007dff'
      name: 'Saltmarsh'
    algal_mat:
      color: '#ffe048'
      name: 'Algal Mat'
    other:
      color: '#1dcbea'
      name: 'Other'

  constructor: (elementId, mapOpts={}) ->
    @baseMap = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png', 
      { maxZoom: 17}
    )
    @baseSatellite =  new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "AerialWithLabels", maxZoom: 19})

    @initializeMap(elementId, mapOpts)
    @addAttribution()
    @addOverlays(mapOpts.countryIso, (err, overlays) =>
      L.control.layers(@baseMaps, overlays, {collapsed:false}).addTo(@map)
    )

  initializeMap: (elementId, mapOpts) ->
    maxBounds = L.latLngBounds(mapOpts.bounds)
    mapOpts.center = maxBounds.getCenter()
    mapOpts.layers = [@baseMap]

    @map = L.map(elementId, mapOpts)
    @map.fitBounds(maxBounds)

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

        sublayers[@getLegendItemHtml(sublayer)] = L.tileLayer(tilesUrl).addTo(@map)
        cb(null, sublayers)
      )
    , done)

  getSublayers: ->
    _.map(HABITATS, (properties, habitat) ->
      where = "toggle::boolean = true AND (validate_action <> 'delete' OR validate_action IS NULL)"
      style = """
        #bc_#{habitat} {
          line-color: #FFF;
          line-width: 0.5;
          polygon-fill: #{properties.color};
          polygon-opacity: 0.5
        }
      """

      {habitat: habitat, where: where, style: style}
    )

  getLegendItemHtml: (sublayer) ->
    prettyName = polyglot.t("analysis.#{sublayer.habitat}")

    return "<div class='custom-radio-row'>
              <span class='custom-radio custom-radio__outer'>
                <div class='custom-radio__inner' style='background-color:" + HABITATS[sublayer.habitat].color + "'></div>
              </span>
              <span>"+prettyName+"</span>
            </div>"
