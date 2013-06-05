class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @validations.reset options.validations

    @areas = new BlueCarbon.Collections.AreasCollection()
    @areas.reset options.areas

  routes:
    "new"                                : "newValidation"
    "new/:z/:y/:x"                       : "newValidation"
    "new/:z/:y/:x/:prev_validation_id"   : "newValidation"
    "index"                              : "index"
    ":id/edit"                           : "edit"
    ":id"                                : "show"
    ".*"                                 : "index"

  newValidation: (z, y, x, prev_validation_id) ->
    @view = new BlueCarbon.Views.Validations.NewView(
      collection: @validations, areas: @areas)
    $("#validations").html(@view.render().el)

    # Map
    args = 
      map_id: 'map'
      coordinates: @findCoordinates()
      prev_validation_id: prev_validation_id
    if z && y && x
      @initializeMap _.extend( {center: [y, x], zoom: z }, args )
    else
      @initializeMap args

    # Upload photo
    new AjaxUpload 'upload-photo'
      action: '/photos'
      name: 'photo[attachment]'
      data:
        authenticity_token: $("meta[name='csrf-token']").attr("content")
      responseType: 'json'
      onSubmit: (file, extension) ->
        $('#upload-photo').hide()
        $("#photos-table tbody").append('<tr><td colspan="2"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></td></td></tr>')
      onComplete: (file, response) =>
        if response.errors?
          #errors = for key, message of response.errors
          #  message
          #$('#upload-photo-progress').after("<div class=\"alert alert-error\">Image #{errors[0]}</div>")
        else
          photo_ids = @view.model.get('photo_ids')
          photo_ids = photo_ids.concat(response['id'])
          @view.model.set('photo_ids', photo_ids)

          photos = @view.model.get('photos')
          photos = photos.concat(response)
          @view.model.set('photos', photos)

          tr_content = $("<td><img src='#{response.thumbnail_url}' /></td><td><a href='#' class='btn'>Remove</a></td>")
          tr_content.find('a').click (e) =>
            photo_ids = @view.model.get('photo_ids')
            @view.model.set('photo_ids', _.without(photo_ids, response['id']))

            @view.model.set('photos', _.reject(@view.model.get('photos'), (p) -> return p['id'] == photo['id'] ))

            $(e.target).closest('tr').remove()
            return false
          $("#photos-table tbody tr:last-child").html(tr_content)

        $('#upload-photo').show()

  index: ->
    @view = new BlueCarbon.Views.Validations.IndexView(validations: @validations, collection: @validations)
    $("#validations").html(@view.render().el)

  show: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.ShowView(model: validation, areas: @areas)
    $("#validations").html(@view.render().el)

    # Map
    args = 
      map_id: 'map'
      coordinates: JSON.parse(validation.get('coordinates'))
      validation_id: id
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

    # Upload photo
    new AjaxUpload 'upload-photo'
      action: '/photos'
      name: 'photo[attachment]'
      data:
        authenticity_token: $("meta[name='csrf-token']").attr("content")
      responseType: 'json'
      onSubmit: (file, extension) ->
        $('#upload-photo').hide()
        $("#photos-table tbody").append('<tr><td colspan="2"><div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div></td></td></tr>')
      onComplete: (file, response) =>
        if response.errors?
          #errors = for key, message of response.errors
          #  message
          #$('#upload-photo-progress').after("<div class=\"alert alert-error\">Image #{errors[0]}</div>")
        else
          photo_ids = @view.model.get('photo_ids')
          photo_ids = photo_ids.concat(response['id'])
          @view.model.set('photo_ids', photo_ids)

          photos = @view.model.get('photos')
          photos = photos.concat(response)
          @view.model.set('photos', photos)

          tr_content = $("<td><img src='#{response.thumbnail_url}' /></td><td><a href='#' class='btn'>Remove</a></td>")
          tr_content.find('a').click (e) =>
            photo_ids = @view.model.get('photo_ids')
            @view.model.set('photo_ids', _.without(photo_ids, response['id']))
            $(e.target).closest('tr').remove()
            return false
          $("#photos-table tbody tr:last-child").html(tr_content)

        $('#upload-photo').show()

    for photo in validation.get('photos')
      tr_content = $("<tr><td><img src='#{photo.thumbnail_url}' /></td><td><a href='#' class='btn'>Remove</a></td></tr>")
      tr_content.find('a').click (e) =>
        photo_ids = @view.model.get('photo_ids')
        @view.model.set('photo_ids', _.without(photo_ids, photo['id']))

        @view.model.set('photos', _.reject(@view.model.get('photos'), (p) -> return p['id'] == photo['id'] ))

        $(e.target).closest('tr').remove()
        return false
      $("#photos-table tbody").append(tr_content)

  renderUndoButton: () =>
    undoButtonSelector = $('#draw-a-polygon').find("#undo-draw-vertex")

    if @polygonDraw?
      markerCount = @polygonDraw._markers.length

      if markerCount > 0
        unless undoButtonSelector.length > 0
          undoButton = $('<a id="undo-draw-vertex" class="btn undo">')
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
    map_id = args.map_id
    prev_validation_id = args.prev_validation_id
    coordinates = args.coordinates
    center = args.center || [24.5, 54]
    zoom = args.zoom || 9

    baseMap = L.tileLayer('http://tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {maxZoom: 19})
    baseSatellite =  new L.BingLayer("ApZALeudlU-OTm7Me2qekFHrstBXNdv3hft6qy3ZeTQWD6a460-QqCQyYnDigINc", {type: "Aerial", maxZoom: 19})

    map = L.map map_id,
      center: center
      zoom: zoom
      minZoom: 8
      maxZoom: 19
      layers: [baseSatellite]

    # Clean polygonDraw
    delete @polygonDraw

    # Action draw a polygon
    $('#draw-a-polygon .btn').click (e) =>
      $(e.target).toggleClass('btn-inverse btn-primary')

      @polygonDraw = new L.Polygon.Draw(map, {shapeOptions: {color: '#bdd455'}}) unless @polygonDraw?
      map.on('draw:polygon:add-vertex', @renderUndoButton)

      if $(e.target).hasClass('active')
        @polygonDraw.disable()
      else
        @polygonDraw.enable()

    # Scale
    L.control.scale().addTo(map)

    # Layers
    baseMaps =
      'Map': baseMap
      'Satellite': baseSatellite

    overlayMaps =
      'Mangrove': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_mangrove/{z}/{x}/{y}.png?sql=SELECT * FROM bc_mangrove WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
      'Seagrass': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_seagrass/{z}/{x}/{y}.png?sql=SELECT * FROM bc_seagrass WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
      'Saltmarsh': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_saltmarsh/{z}/{x}/{y}.png?sql=SELECT * FROM bc_saltmarsh WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
      'Algal Mat': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_algal_mat/{z}/{x}/{y}.png?sql=SELECT * FROM bc_algal_mat WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)
      'Other': L.tileLayer('https://carbon-tool.cartodb.com/tiles/bc_other/{z}/{x}/{y}.png?sql=SELECT * FROM bc_other WHERE toggle = true AND (action <> \'delete\' OR action IS NULL)').addTo(map)

    L.control.layers(baseMaps, overlayMaps).addTo(map)

    drawnItems = new L.LayerGroup()

    # If we have a previous validation, then show it on the map.
    if prev_validation_id
      validation = @validations.get prev_validation_id
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
    map.on 'draw:poly-created', (e) =>
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

