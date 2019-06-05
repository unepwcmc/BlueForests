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
    @baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 17})
    @baseSatellite =  new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "Aerial", maxZoom: 19})

    @initializeMap(elementId, mapOpts)
    @addAttribution()
    # @addLegend()
    @addOverlays(mapOpts.countryIso, (err, overlays) =>
      L.control.layers(@baseMaps, overlays).addTo(@map)
    )

  initializeMap: (elementId, mapOpts) ->
    maxBounds = L.latLngBounds(mapOpts.bounds)
    mapOpts.center = maxBounds.getCenter()
    mapOpts.layers = [@baseSatellite]

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
      where = "toggle = true AND (action <> 'delete' OR action IS NULL)"
      style = """
        #bc_#{habitat} {
          line-color: #FFF;
          line-width: 0.5;
          polygon-fill: #{properties.color};
          polygon-opacity: 0.4
        }
      """

      {habitat: habitat, where: where, style: style}
    )

  addLegend: ->
    legend = L.control({position: 'topright'})

    legend.onAdd = ->
      div = L.DomUtil.create('div', 'info-legend')

      for habitat, properties of HABITATS
        div.innerHTML += """
          <p><i style="background-color:#{properties.color}"></i>#{properties.name}</p>
        """

      div

    legend.addTo(@map)

  getLegendItemHtml: (sublayer) ->
    prettyName = polyglot.t("analysis.#{sublayer.habitat}")

    return "<div class='custom-checkbox-row'>
              <span class='custom-checkbox custom-checkbox__outer'>
                <div class='custom-checkbox__inner' style='background-color:" + HABITATS[sublayer.habitat].color + "'></div>
              </span>
              <span>"+prettyName+"</span>
            </div>"
