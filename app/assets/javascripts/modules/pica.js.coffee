window.Pica ||= {}
class Pica.Events
  on: (event, callback) ->
    @events ||= {}
    @events[event] ||= []
    @events[event].push callback

  off: (event, callback) ->
    return unless @events?

    if event?
      if @events[event]?
        if callback?
          for eventCallback, index in @events[event]
            if eventCallback == callback
              @events[event].splice(index, 1)
              index -= 1
        else
          delete @events[event]
    else
      @events = []

  trigger: (event, args) ->
    if @events? && @events[event]?
      for callback in @events[event]
        callback.apply(@, [].concat(args))

class Pica.Model extends Pica.Events
  throwIfNoApp: ->
    unless @app?
      throw "Cannot create a Pica.Model without specifying a Pica.Application"

  url: () ->

  get: (attribute) ->
    @attributes ?= {}
    @attributes[attribute]

  set: (attribute, value) ->
    @attributes ?= {}
    @attributes[attribute] = value
    @trigger('change')

  sync: (options = {}) ->
    successCallback = options.success || () ->

    # Extend callback to add returned data as model attributes.
    options.success = (data, textStatus, jqXHR) =>
      #data = JSON.parse(data) unless 'object' == typeof data
      if data?.id?
        @parse(data)
        @trigger('sync', @)

      @app.notifySyncFinished()
      successCallback(@, textStatus, jqXHR)

    errorCallback = options.error || () ->

    # Extend callback to add returned data as model attributes.
    options.error = (data, textStatus, jqXHR) =>
      @app.notifySyncFinished()
      errorCallback(@, textStatus, jqXHR)

    if options.type == 'post' or options.type == 'put'
      data = @attributes
      data = JSON.stringify(data) if options.type == 'post'

    # Send nothing for delete, and set contentType,
    # otherwise JQuery will try to parse it on return.
    if options.type == 'delete'
      data = null

    @app.notifySyncStarted()

    $.ajax(
      $.extend(
        options,
        contentType: "application/json"
        dataType: "json"
        data: data
      )
    )

  # Parse the data that is returned from the server.
  parse: (data) ->
    for attr, val of data
      @set(attr, val)

  save: (options = {}) =>
    if @get('id')?
      options.url = if @url().read? then @url().read else @url()
      options.type = 'put'
    else
      options.url = if @url().create? then @url().create else @url()
      options.type = 'post'
    sync = @sync(options)
    #sync.done => console.log("saving #{@constructor.name} #{@get('id')}")
    sync


  fetch: (options = {}) =>
    options.url = if @url().read? then @url().read else @url()
    #console.log("fetching #{@constructor.name} #{@get('id')}")
    @sync(options)

  destroy: (options = {}) =>
    options.url = if @url().read? then @url().read else @url()
    options.type = 'delete'
    originalCallback = options.success
    options.success = =>
      @trigger('delete')
      #console.log("deleted #{@constructor.name} #{@get('id')}")
      originalCallback() if originalCallback
      @off()
    @sync(options)

#
# * pica.js
# * https://github.com/unepwcmc/pica.js
# *
# * Copyright (c) 2012 UNEP-WCMC
#

window.Pica ||= {}
Pica.Models = {}
Pica.Views = {}

class Pica.Application extends Pica.Events
  constructor: (@config) ->
    Pica.config = @config

    $.support.cors = true

    $.ajaxSetup
      headers:
        'X-Magpie-ProjectId': Pica.config.projectId

    @layers = []
    @fetch()

    # If Leaflet LayerControl activation is delegated
    # to pica, then show Tile Layers by default.
    if @config.delegateLayerControl then @showTileLayers()

  newWorkspace: (options) ->
    @currentWorkspace = new Pica.Models.Workspace(@, options)

  showTileLayers: ->
    new Pica.Views.ShowLayersView(app:@)

  fetch: ->
    $.ajax(
      url: "#{Pica.config.magpieUrl}/projects/#{Pica.config.projectId}.json"
      type: 'get'
      success: @parse
    )

  parse: (data) =>
    for attr, val of data
      @[attr] = val
    @trigger('sync')

  notifySyncStarted: ->
    @syncsInProgress or= 0
    @syncsInProgress = @syncsInProgress + 1

    if @syncsInProgress is 1
      @trigger('syncStarted')

  notifySyncFinished: ->
    @syncsInProgress or= 0
    @syncsInProgress = @syncsInProgress - 1

    if @syncsInProgress is 0
      @trigger('syncFinished')

class Pica.Models.Area extends Pica.Model
  constructor: (@app, defaults={}) ->
    @throwIfNoApp()
    @polygons = []

    defaults = $.extend(defaults, {'name': 'My Lovely Area'})
    for property, value of defaults
      @set(property, value)

  setName: (name) ->
    @set('name', name)

  addPolygon: (polygon) ->
    polygon.on('requestAreaId', @getAreaId)
    polygon.on('sync', => @fetch())
    polygon.on('delete', => @fetch())
    @polygons.push(polygon)
    @trigger('addedPolygon', polygon)

  # Passes the area with an ID to success option
  # or passes an error
  getAreaId: (options) =>
    if @get('id')?
      options.success(@)
    else
      @save(options)

  # Create a new Pica.Views.NewPolygonView for this area
  drawNewPolygonView: (callbacks) ->
    @createPolygon()
    new Pica.Views.NewPolygonView(
      callbacks: callbacks
      polygon: @currentPolygon
    )

  # Create a new Pica.Views.NewCircleView for this area
  drawNewCircleView: (callbacks) ->
    @createPolygon()
    new Pica.Views.NewCircleView(
      callbacks: callbacks
      polygon: @currentPolygon
    )

  createPolygon: ->
    @currentPolygon = new Pica.Models.Polygon(@app)
    @addPolygon(@currentPolygon)

  # Create a new Pica.Views.UploadPolygonView for this area
  newUploadFileView: (callbacks) ->
    new Pica.Views.UploadFileView(
      callbacks: callbacks
      area: @
    )

  # spawns a new ShowAreaPolygonsView for this area
  newShowAreaPolygonsView: () ->
    new Pica.Views.ShowAreaPolygonsView(
      area: @
    )

  url: () ->
    url = Pica.config.magpieUrl
    create: "#{url}/workspaces/#{@get('workspace_id')}/areas_of_interest.json"
    read:   "#{url}/areas_of_interest/#{@get('id')}.json"

  parse: (data) ->
    if data.polygons?
      @polygons = []
      for polygonAttributes in data.polygons
        polygon = new Pica.Models.Polygon(@app, attributes:polygonAttributes)
        @addPolygon(polygon)
      delete data.polygons
    else
      # Remove persisted polygons
      unPersistedPolygons = []
      for polygon, index in @polygons
        unPersistedPolygons.push(polygon) unless polygon.get('id')?
      @polygons = unPersistedPolygons

    super

  save: (options) =>
    options ||= {}

    if @get('workspace_id')?
      super options
    else
      @trigger('requestWorkspaceId',
        success: (workspace, textStatus, jqXHR) =>
          @set('workspace_id', workspace.get('id'))
          if @get('workspace_id')
            @save options
          else
            options.error(
              @,
              {error: "Could not save workspace, so cannot save area"},
              jqXHR
            )
        error: (jqXHR, textStatus, errorThrown) =>
          console.log "Unable to save area:"
          console.log arguments
          console.log jqXHR.status
          console.log jqXHR.statusText
          console.log jqXHR.responseText
          options.error(
            jqXHR,
            textStatus,
            {
              error: "Unable to obtain workspaceId, cannot save area",
              parentError: errorThrown
            }
          ) if options.error?
      )

class Pica.Models.Polygon extends Pica.Model
  constructor: (@app, options = {}) ->
    @throwIfNoApp()
    @attributes = if options.attributes? then options.attributes else {}
    @attributes['geometry'] ||= {type: 'Polygon'}

  isComplete: () ->
    return @get('geometry').coordinates?

  setGeomFromPoints: (points) ->
    points = for point in points
      [point.lng, point.lat]

    points.push points[0]

    @set('geometry',
      type: 'Polygon'
      coordinates: [points]
    )

  setGeomFromCircle: (latLng, radius) ->
    @set('geometry',
      type: 'Circle'
      coordinates: [latLng.lng, latLng.lat]
      radius: radius
    )

  asLeafletArguments: () ->
    args = []

    if (@get('geometry').type == 'Polygon')
      latLngs = []
      if @isComplete()
        for point in @get('geometry').coordinates[0]
          latLngs.push(new L.LatLng(point[1], point[0]))
      args.push latLngs
    else
      if @isComplete()
        point = @get('geometry').coordinates
        args = [new L.LatLng(point[1], point[0]), @get('geometry').radius]
      else
        args = [[], 0]

    return args

  url: () ->
    url = Pica.config.magpieUrl
    read: "#{url}/polygons/#{@get('id')}.json"
    create: "#{url}/areas_of_interest/#{@get('area_id')}/polygons.json"

  save: (options) =>
    options ||= {}

    if @get('area_id')?
      super options
    else
      @trigger('requestAreaId',
        success: (area, textStatus, jqXHR) =>
          @set('area_id', area.get('id'))
          if @get('area_id')
            @save options
          else
            options.error(
              @,
              {error: "Unable to get area id, so cannot save polygon"},
              jqXHR
            ) if options.error?
        error: (jqXHR, textStatus, errorThrown) =>
          console.log "Unable to save polygon:"
          console.log arguments
          console.log jqXHR.status
          console.log jqXHR.statusText
          console.log jqXHR.responseText
          options.error(
            jqXHR,
            textStatus,
            {
              error: "Unable to obtain areaId, cannot save polygon",
              parentError: errorThrown
            }
          ) if options.error?
      )

class Pica.Models.Workspace extends Pica.Model
  constructor: (@app, @areasDefaults) ->
    @throwIfNoApp()
    @attributes = {}
    @areas = []

    @currentArea = new Pica.Models.Area(@app, @areasDefaults)
    @addArea(@currentArea)

  url: () ->
    "#{Pica.config.magpieUrl}/workspaces.json"

  addArea: (area) ->
    unless area?
      area = new Pica.Models.Area(@app, @areasDefaults)
    area.on('requestWorkspaceId', (options) =>
      if @get('id')?
        options.success(@)
      else
        @save(options)
    )
    @areas.push(area)

    area

  removeArea: (theArea) ->
    id = @areas.indexOf(theArea)
    area = @areas.splice(id, 1)[0]
    if area.get('id')?
      area.destroy()

  setCurrentArea: (theArea) ->
    for area in @areas
      if area == theArea
        @currentArea = area

  setCurrentAreaById: (areaId) ->
    for area in @areas
      if area.get('id') == areaId
        @currentArea = area

  save: (options) =>
    super options

class Pica.Views.NewCircleView
  constructor: (options) ->
    if options.callbacks?
      @successCallback = options.callbacks.success
      @errorCallback = options.callbacks.error

    @polygon = options.polygon
    @polygon.set('geometry', {type:'Circle'})

    # Turn on Leaflet.draw polygon tool
    @polygonDraw = new L.Circle.Draw(Pica.config.map, {})
    @polygonDraw.enable()

    Pica.config.map.on 'draw:circle-created', (e) =>
      @createPolygon e.circ

  createPolygon: (mapCircle) ->
    @polygon.setGeomFromCircle(mapCircle.getLatLng(), mapCircle.getRadius())
    @polygon.save(
      success: =>
        @close()
        @successCallback() if @successCallback?
      error: (xhr, textStatus, errorThrown) =>
        @close()
        @errorCallback.apply(@, arguments) if @errorCallback?
    )

  close: () ->
    @polygonDraw.disable()
    Pica.config.map.off('draw:circle-created')

class Pica.Views.NewPolygonView
  constructor: (options) ->
    if options.callbacks?
      @successCallback = options.callbacks.success
      @errorCallback = options.callbacks.error

    @polygon = options.polygon

    # Turn on Leaflet.draw polygon tool
    @polygonDraw = new L.Polygon.Draw(Pica.config.map, {})
    @polygonDraw.enable()

    Pica.config.map.on 'draw:poly-created', (e) =>
      mapPolygon = e.poly
      @createPolygon mapPolygon

  createPolygon: (mapPolygon) ->
    @polygon.setGeomFromPoints(mapPolygon.getLatLngs())
    @polygon.save(
      success: () =>
        @close()
        @successCallback() if @successCallback?
      error: (xhr, textStatus, errorThrown) =>
        @close()
        @errorCallback.apply(@, arguments) if @errorCallback?
    )

  close: () ->
    @polygonDraw.disable()
    Pica.config.map.off('draw:poly-created')

class Pica.Views.ShowAreaPolygonsView extends Pica.Events
  constructor: (options) ->
    @area = options.area
    @polysObserved = []
    @mapPolygons = []
    @area.on('sync', @render)
    @area.on('addedPolygon', @addPolygon)
    @render()

  render: =>
    @removeAllPolygonsAndBindings()

    for polygon in @area.polygons
      continue unless polygon.isComplete()

      # Method which emulates calling 'new theConstructor.apply(@, args)'
      newObject = (theConstructor, args)->
        Wrapper = (args) ->
          return theConstructor.apply(@, args)
        Wrapper:: = theConstructor::
        return new Wrapper(args)
      mapPolygon = newObject(L[polygon.get('geometry').type],
        polygon.asLeafletArguments()).addTo(Pica.config.map)

      polygon.on('delete', (=>
        thatMapPolygon = mapPolygon
        return =>
          @removeMapPolygonAndBindings(thatMapPolygon)
      )())

      mapPolygon.on('click', (=>
        thatPolygon = polygon
        thatMapPolygon = mapPolygon
        return (event) =>
          @triggerPolyClick(thatPolygon, event, thatMapPolygon)
      )())

      @mapPolygons.push(mapPolygon)

  addPolygon: (polygon) =>
    polygon.on('change', @render)
    @polysObserved.push(polygon)

  close: ->
    @removeAllPolygonsAndBindings()
    @area.off('sync', @render)
    @area.off('addedPolygon', @addPolygon)
    for polygon in @polysObserved
      polygon.off('change', @render)

  removeAllPolygonsAndBindings: ->
    while mapPolygon = @mapPolygons.shift()
      @removeMapPolygonAndBindings(mapPolygon)

  removeMapPolygonAndBindings: (mapPolygon) ->
    mapPolygon.off('click', @triggerPolyClicked)
    Pica.config.map.removeLayer mapPolygon

  triggerPolyClick: (polygon, event, mapPolygon) =>
    @trigger('polygonClick', [polygon, event, mapPolygon])

class Pica.Views.ShowLayersView
  constructor: (options) ->
    @app = options.app
    @app.on('sync', @render)
    @tileLayers = {}
    @layerControl = no

  # For every layer in @app.layers,
  # we build a @tileLayers object, compatible with the arguments to
  # L.control.layers, and, if we are not delegating the Layer Control
  # functionality to Pica, we simply add every layer to the map in order.
  render: =>
    @removeTileLayers()
    @removeLayerControl()
    for layer in @app.layers
      tileLayer = L.tileLayer(layer.tile_url)
      @tileLayers[layer.display_name] = tileLayer
      if not @app.config.delegateLayerControl
        tileLayer.addTo(@app.config.map)
    if @app.config.delegateLayerControl
      @layerControl = @renderLayerControl @app.config.map

  # If we are delegating the Layer Control functionality to Pica:
  # first we merge optional extra overlays from the config into
  # @tileLayers and then we show the first layer in the Layer Control.
  renderLayerControl: (map) ->
    extraOverlays = @app.config.extraOverlays or {}
    layers = $.extend @tileLayers, extraOverlays
    @showFirstOverlay(layers, map)
    L.control.layers({}, layers).addTo map

  showFirstOverlay: (layers, map) ->
    for name, layer of layers
      layer.addTo map
      return

  removeTileLayers: =>
    for name, tileLayer of @tileLayers
      @app.map.removeLayer(tileLayer)

  removeLayerControl: ->
    if @layerControl
      @layerControl.removeFrom @app.map

  close: ->
    @removeTileLayers()
    @removeLayerControl()
    @app.off('sync', @render)

class Pica.Views.UploadFileView extends Pica.Events
  constructor: (options) ->
    if options.callbacks?
      @successCallback = options.callbacks.success
      @errorCallback = options.callbacks.error
    @area = options.area
    @el = document.createElement("div")

    @area.getAreaId(success:@render)

  render: =>
    formFrame = document.createElement('iframe')
    formFrame.src = "#{Pica.config.magpieUrl}/areas_of_interest/#{@area.get('id')}/polygons/new_upload_form/"
    formFrame.className = "pica-upload-form"
    @el.appendChild(formFrame)
    window.addEventListener("message", @onUploadComplete, false)

  onUploadComplete: (event) =>
    if event.origin == Pica.config.magpieUrl and event.data.polygonImportStatus?
      if event.data.polygonImportStatus == 'Successful import' and @successCallback?
        @successCallback(event.data.polygonImportStatus, event.data.importMessages)
      else if @errorCallback?
        @errorCallback(event.data.polygonImportStatus, event.data.importMessages)
      @close()

  close: ->
    window.removeEventListener("message", @onUploadComplete)
    $(@el).remove()
