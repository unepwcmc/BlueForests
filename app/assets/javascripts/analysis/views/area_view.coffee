window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaView extends Backbone.View
  template: JST['area']

  events:
    'click #delete-area': 'deleteArea'
    'click #new-polygon': 'toggleDrawing'
    'click #undo-vertex': 'removeLastMarker'

  initialize: (options) ->
    @area = options.area
    @area.on('change', @render)

    @showAreaPolygonsView = window.pica.currentWorkspace.currentArea.newShowAreaPolygonsView()
    @showAreaPolygonsView.on("polygonClick", @handlePolygonClick)

    @render()

  toggleDrawing: (event) ->
    if @polygonView?
      @removeNewPolygonView()
      @renderUndoButton()
      Pica.config.map.off('draw:poly-created', @renderLoadingSpinner)
      Pica.config.map.off('draw:polygon:add-vertex', @renderUndoButton)
    else
      Pica.config.map.on('draw:poly-created', @renderLoadingSpinner)
      Pica.config.map.on('draw:polygon:add-vertex', @renderUndoButton)

      @polygonView = @area.drawNewPolygonView(
        success: () =>
          @removeNewPolygonView()
          @template = JST['area']
        error: (xhr, textStatus, errorThrown) =>
          alert("Can't save polygon: #{errorThrown}")
      )

  renderUndoButton: () =>
    undoButtonSelector = $('.new-polygon-container').find("#undo-vertex")

    if @polygonView?
      markerCount = @polygonView.polygonDraw._markers.length

      if markerCount > 0
        unless undoButtonSelector.length > 0
          $('.new-polygon-container').append($('<a id="undo-vertex" class="btn undo">'))
        return

    undoButtonSelector.remove()

  removeLastMarker: ->
    @polygonView.polygonDraw.removeLastMarker()
    @renderUndoButton()

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
    

  humanEmissionsAsTime: (timeInYears) ->
    timeInYears = roundToDecimals(timeInYears, 2)

    if timeInYears < 1
      return "#{timeInYears * 365} <span>days</span>"

    return "#{timeInYears} <span>years</span>"

  resultsToObj: ->
    if @area.get('results')?
      results =
        sum: {}
        habitats: {}

      compareByName = (name) ->
        (obj) ->
          obj.display_name == name

      getResultByName = (name) =>
        _.find(@area.get('results'), compareByName(name)).value

      values =
        carbon: getResultByName("Carbon")
        area_km2: getResultByName("Area")
        habitat_percentage: getResultByName("Percentage")

      _.each values, (habitats, operation) ->
        _.each habitats, (habitat) ->
          results.habitats[habitat.habitat] ||= {}
          results.habitats[habitat.habitat][operation] = habitat[operation]

      results.sum.area = getResultByName("Total Area")
      results.sum.carbon = getResultByName("Total Carbon")
      results.sum.human_emissions = @humanEmissionsAsTime(getResultByName("Emissions"))

      return results
    else
      return {}

  renderLoadingSpinner: (e) =>
    @template = JST['area_loading']
    @render()

  render: =>
    @$el.html(@template(area: @area, results: @resultsToObj()))
    return @

  onClose: ->
    @removeNewPolygonView()
    Pica.config.map.off('draw:poly-created', @renderLoadingSpinner)
    Pica.config.map.off('draw:polygon:add-vertex', @renderUndoButton)
    @showAreaPolygonsView.off("polygonClick", @handlePolygonClick)
    @showAreaPolygonsView.close()
    @area.off('sync', @render)
