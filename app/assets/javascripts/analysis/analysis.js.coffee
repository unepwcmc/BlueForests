initializeMap = () ->
  baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 17})
  baseSatellite = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', {maxZoom: 17})

  map = L.map 'map_analysis',
    center: [24.5, 54]
    zoom: 9
    layers: [baseSatellite]
    minZoom: 8
    maxZoom: 17

  baseMaps =
    'Map': baseMap
    'Satellite': baseSatellite

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

    prettyName = habitat.replace("_", " ")
    prettyName = prettyName.replace(/\w\S*/g, (t) -> t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())
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

  tabsView = new Backbone.Views.TabsView().render()
  $('#sidebar').html(tabsView.el)

$(document).ready ->
  map = initializeMap() if $('#map_analysis').length > 0
  initializePica(map) if map?
