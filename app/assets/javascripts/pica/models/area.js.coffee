window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

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

