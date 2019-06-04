window.Pica ||= {}
Pica.Models ||= {}
Pica.Views ||= {}

class Pica.Application extends Pica.Events
  constructor: (@config) ->
    Pica.config = @config

    $.support.cors = true

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
      headers:
        'X-Magpie-ProjectId': Pica.config.projectId
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

