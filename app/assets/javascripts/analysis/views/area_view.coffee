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
    if @area.get('results')?
      results =
        sum: {}
        habitats: {}

      values =
        carbon: @area.get('results')[0].value_json.rows
        area: @area.get('results')[1].value_json.rows

      _.each values, (habitats, operation) ->
        _.each habitats, (habitat) ->
          results.habitats[habitat.habitat] ||= {}
          results.habitats[habitat.habitat][operation] = habitat[operation]

          results.sum[operation] ||= 0
          results.sum[operation]  += habitat[operation]

      results.sum.human_emissions = @area.get('results')[2].value || 0

      return results
    else
      return {}

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
