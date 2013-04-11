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
    'Mangrove': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_mangrove/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_mangrove WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)
    'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_seagrass/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_seagrass WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)
    'Sabkha': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_sabkha/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_sabkha WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)
    'Saltmarsh': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_saltmarsh/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_saltmarsh WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)
    'Algal Mat': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_algal_mat/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_algal_mat WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)
    'Other': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_other/{z}/{x}/{y}.png?sql=SELECT ST_Transform(st_union(the_geom), 3857) AS the_geom_webmercator, habitat FROM bc_other WHERE (action <> \'delete\' OR action IS NULL) AND toggle = true GROUP BY habitat;').addTo(map)

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
