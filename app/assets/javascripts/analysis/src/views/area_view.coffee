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
    else
      @polygonView = @area.drawNewPolygonView(@area,
        success: () =>
          @removeNewPolygonView()
          @render()
          error: (xhr, textStatus, errorThrown) =>
            alert("Can't save polygon: #{errorThrown}")
      )

  removeNewPolygonView: ->
    if @polygonView?
      @polygonView.close()
      delete @polygonViewView

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

  render: =>
    @resultsToObj()
    @$el.html(@template(area: @area, results: @resultsToObj()))
    return @

  onClose: ->
    @removeNewPolygonView()
    @showAreaPolygonsView.off("polygonClick", @handlePolygonClick)
    @showAreaPolygonsView.close()
    @area.off('sync', @render)
