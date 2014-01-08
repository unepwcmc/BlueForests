initializeMap = () ->
  baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 17})
  baseSatellite =  new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "Aerial", maxZoom: 19})

  map = L.map 'map_analysis',
    center: [24.5, 54]
    zoom: 9
    layers: [baseSatellite]
    minZoom: 8
    maxZoom: 19

  baseMaps = {}
  baseMaps[polyglot.t('analysis.map')] = baseMap
  baseMaps[polyglot.t('analysis.satellite')] = baseSatellite

  overlayMaps = {}
  habitats = {
    mangrove: '#008b00'
    seagrass: '#9b1dea'
    saltmarsh: '#007dff'
    algal_mat: '#ffe048'
    other: '#1dcbea'
  }

  _.each habitats, (polygon_fill, habitat) ->
    query = "SELECT * FROM bc_#{habitat} WHERE toggle = true AND (action <> 'delete' OR action IS NULL)"
    style = """
      #bc_#{habitat} {
        line-color: #FFF;
        line-width: 0.5;
        polygon-fill: #{polygon_fill};
        polygon-opacity: 0.4
      }
    """
    url   = "http://carbon-tool.cartodb.com/tiles/bc_#{habitat}/{z}/{x}/{y}.png?sql=#{query}&style=#{style}"

    prettyName = polyglot.t("analysis.#{habitat}")
    overlayMaps[prettyName] = L.tileLayer(url).addTo(map)

  L.control.layers(baseMaps, overlayMaps).addTo(map)

  attribution = L.control.attribution(
    position: 'bottomleft'
    prefix: ''
  )
  attribution.addAttribution('Developed for the Abu Dhabi Blue Carbon Demonstration Project')
  attribution.addTo(map)

  return map

initializePica = (map) ->
  window.pica = new Pica.Application(
    magpieUrl: "http://magpie.unepwcmc-005.vm.brightbox.net"
    projectId: 4
    map: map
  )

  window.pica.newWorkspace()

  window.router = new Backbone.Routers.AnalysisRouter()
  Backbone.history.start()

invertLocaleOnPermalink = (permalink) ->
  currentLocale = polyglot.locale()
  if currentLocale == "ar"
    locale = "en"
  else
    locale = "ar"
  permalink.replace "/#{currentLocale}/", "/#{locale}/"

setupTranslationLink = ->
  $("#language > a").on "click", (e) ->
    if window.pica.currentWorkspace.currentArea.get("id")
      e.stopPropagation()
      e.preventDefault()
      permalink = invertLocaleOnPermalink $(".permalink :text").val()
      window.location.href = permalink

$(document).ready ->
  map = initializeMap() if $('#map_analysis').length > 0
  initializePica(map) if map?
  setupTranslationLink()
