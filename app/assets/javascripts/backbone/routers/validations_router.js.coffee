class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @countryIso = options.countryIso
    @countryBounds = options.countryBounds

    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @validations.reset options.validations

    @areas = new BlueCarbon.Collections.AreasCollection()
    @areas.reset options.areas

  routes:
    "new"                                : "newValidation"
    "new/:z/:y/:x"                       : "newValidation"
    "new/:z/:y/:x/:prevValidationId"     : "newValidation"
    ":id/edit"                           : "edit"

  newValidation: (z, y, x, prevValidationId) ->
    @view = new BlueCarbon.Views.Validations.NewView(
      countryIso: @countryIso, collection: @validations, areas: @areas)
    $("#new-validation").replaceWith(@view.render().el)

    # Map
    args =
      map_id: 'map'
      coordinates: @findCoordinates()
      prevValidationId: prevValidationId
      bounds: @countryBounds
    if z && y && x
      @initializeMap _.extend( {center: [y, x], zoom: z }, args )
    else
      @initializeMap args

  edit: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.EditView(model: validation, areas: @areas)
    $("#validations").html(@view.render().el)

    # Map
    args =
      map_id: 'map'
      coordinates: JSON.parse(validation.get('coordinates'))
      validation_id: id
    @initializeMap args

  renderUndoButton: () =>
    undoButtonSelector = $('#draw-a-polygon').find("#undo-draw-vertex")

    if @polygonDraw?
      markerCount = @polygonDraw._markers.length

      if markerCount > 0
        unless undoButtonSelector.length > 0
          undoButton = $('<button id="undo-draw-vertex" class="btn">Undo point</button>')
          undoButton.click (e) =>
            @removeLastMarker()

          $('#draw-a-polygon').append(undoButton)
          $('#draw-a-polygon .btn:first').addClass('with-undo')
        return

    undoButtonSelector.remove()
    $('#draw-a-polygon .btn').removeClass('with-undo')

  removeLastMarker: ->
    @polygonDraw.removeLastMarker()
    @renderUndoButton()

  initializeMap: (args) ->
    mapId = args.map_id
    prevValidationId = args.prevValidationId
    coordinates = args.coordinates

    mapOpts = {}
    mapOpts.countryIso = $("##{mapId}").data('country-iso')
    mapOpts.bounds = args.bounds

    map = new Map(mapId, mapOpts).map

    # Clean polygonDraw
    delete @polygonDraw

    # Action draw a polygon
    $('#draw-a-polygon .btn').click (e) =>
      $(e.target).toggleClass('btn-inverse btn-primary')

      @polygonDraw = new L.Draw.Polygon() unless @polygonDraw?
      map.on('draw:add-vertex', @renderUndoButton)

      if $(e.target).hasClass('active')
        @polygonDraw.disable()
      else
        @polygonDraw.enable()

    # Scale
    L.control.scale().addTo(map)

    drawnItems = new L.LayerGroup()

    # If we have a previous validation, then show it on the map.
    if prevValidationId
      validation = @validations.get prevValidationId
      coords = JSON.parse(validation.get "coordinates")
      latLngCoordinates = _.map(coords, (arr) -> [arr[1], arr[0]])
      p = new L.polygon(latLngCoordinates)
      map.addLayer(p)

    if coordinates
      latLngCoordinates = _.map(coordinates, (arr) -> [arr[1], arr[0]])
      initialPolygon = new L.polygon(latLngCoordinates)
      bounds = initialPolygon.getBounds()
      drawnItems.addLayer(initialPolygon)
      map.fitBounds(bounds)

      # Show view: new validation
      current_id = @view.model.id  # passing in current validation reference
      # Updating the new validation link with the current map state:
      setNewValidationLink = (evt) ->
        $('#new-validation').attr('href', "#/new/#{map.getZoom()}/#{map.getCenter().lat}/#{map.getCenter().lng}/#{current_id}")
      # Old code, delete once safe about the above new code.
      #$('#new-validation').attr('href', "#/new/#{map.getBoundsZoom(bounds)}/#{bounds.getCenter().lat}/#{bounds.getCenter().lng}/#{current_id}")
      setNewValidationLink()
      map.on('moveend', setNewValidationLink)

    @editableMap(map, drawnItems) if $('#coordinates').length > 0

    map.addLayer(drawnItems)

  editableMap: (map, drawnItems) ->
    map.on L.Draw.Event.CREATED, (e) =>
      latLngs = e.poly.getLatLngs()

      # Check if polygon self intersects
      format = new OpenLayers.Format.WKT()
      op_poly = format.read("POLYGON(#{ _.map(latLngs, (point) -> "#{point.lng} #{point.lat}").join(',') })")

      if checkSelfIntersection(op_poly.geometry)
        alert("Invalid self intersecting polygon detected...")
        $('#draw-a-polygon .btn').toggleClass('btn-inverse active btn-primary')
        return false

      $('#coordinates').val(@latLngsToString(e.poly.getLatLngs())).trigger('change')
      drawnItems.clearLayers()
      drawnItems.addLayer(e.poly)

      $('#draw-a-polygon .btn').toggleClass('btn-inverse active btn-primary')

      $('#draw-a-polygon').addClass('hidden')
      $('#habitat-and-action').removeClass('hidden')

      if @polygonDraw?
        delete @polygonDraw
        @renderUndoButton()

  findCoordinates: ->
    try
      return JSON.parse($('#coordinates').val()) if $('#coordinates').length > 0
    false

  latLngsToString: (latLngs) ->
    "[#{_.map(latLngs, (ll) -> "[#{ll.lng},#{ll.lat}]")}]"
