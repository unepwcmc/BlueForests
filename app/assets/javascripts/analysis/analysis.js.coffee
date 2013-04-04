initializeMap = () ->
  baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 18})
  baseSatellite = L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png', {maxZoom: 18})

  map = L.map 'map_analysis',
    center: [24.5, 54]
    zoom: 9
    layers: [baseSatellite]

  # Layers
  baseMaps =
    'Map': baseMap
    'Satellite': baseSatellite

  overlayMaps =
    'Mangrove': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_mangrove/{z}/{x}/{y}.png?sql=SELECT * FROM bc_mangrove WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_seagrass/{z}/{x}/{y}.png?sql=SELECT * FROM bc_seagrass WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Sabkha': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_sabkha/{z}/{x}/{y}.png?sql=SELECT * FROM bc_sabkha WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Saltmarsh': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_saltmarsh/{z}/{x}/{y}.png?sql=SELECT * FROM bc_saltmarsh WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Algal Mat': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_algal_mat/{z}/{x}/{y}.png?sql=SELECT * FROM bc_algal_mat WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
    'Other': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_other/{z}/{x}/{y}.png?sql=SELECT * FROM bc_other WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)

  L.control.layers(baseMaps, overlayMaps).addTo(map)

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
