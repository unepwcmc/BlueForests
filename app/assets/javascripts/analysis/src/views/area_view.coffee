window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaView extends Backbone.View
  template: JST['area']

  events:
    'click #delete-area': 'deleteArea'
    'click #new-polygon': 'toggleDrawing'

  initialize: (options) ->
    @area = options.area
    @area.on('sync', @render)

    @showAreaPolygonsView = window.pica.currentWorkspace.currentArea.newShowAreaPolygonsView()
    @showAreaPolygonsView.on("polygonClick", @handlePolygonClick)

    @render()

  toggleDrawing: (event) ->
    if @polygonView?
      @removeNewPolygonView()
      Pica.config.map.off('draw:poly-created', @renderLoadingSpinner)
    else
      Pica.config.map.on('draw:poly-created', @renderLoadingSpinner)
      @polygonView = @area.drawNewPolygonView(
        success: () =>
          @removeNewPolygonView()
          @template = JST['area']
          @render()
        error: (xhr, textStatus, errorThrown) =>
          alert("Can't save polygon: #{errorThrown}")
      )

  removeNewPolygonView: ->
    if @polygonView?
      @polygonView.close()
      delete @polygonView

  handlePolygonClick: (polygon, event) ->
    new Backbone.Views.PolyActionsView(
      polygon: polygon
      event: event
    )

  deleteArea: (event) ->
    

  resultsToObj: ->
    keyedResults = {}

    if @area.get('results')?
      results = @area.get('results')[0].value_json.rows
      _.each(results, (result, index) ->
        keyedResults[result.habitat] = {carbon: result.carbon}
      )

    return keyedResults

  renderLoadingSpinner: (e) =>
    @template = JST['area_loading']
    @render()

  render: =>
    @resultsToObj()
    @$el.html(@template(area: @area, results: @resultsToObj()))
    return @

  onClose: ->
    @removeNewPolygonView()
    Pica.config.map.off('draw:poly-created', @renderLoadingSpinner)
    @showAreaPolygonsView.off("polygonClick", @handlePolygonClick)
    @showAreaPolygonsView.close()
    @area.off('sync', @render)
