window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaControlsView extends Backbone.View
  template: JST['area_controls']

  events:
    'click #delete-area': 'deleteArea'
    'click #new-polygon': 'toggleDrawing'
    'click #undo-vertex': 'removeLastMarker'

  initialize: (options) ->
    @area = options.area
    @area.on('change', @render)

  toggleDrawing: (event) ->
    if @polygonView?
      @removeNewPolygonView()
      @renderUndoButton()
      Pica.config.map.off('draw:polygon:add-vertex', @renderUndoButton)
    else
      Pica.config.map.on('draw:polygon:add-vertex', @renderUndoButton)

      @polygonView = @area.drawNewPolygonView(
        success: () =>
          @removeNewPolygonView()
        error: (xhr, textStatus, errorThrown) =>
          alert("Can't save polygon: #{errorThrown}")
      )

  renderUndoButton: () =>
    undoButtonSelector = $('.new-polygon-container').find("#undo-vertex")

    if @polygonView?
      markerCount = @polygonView.polygonDraw._markers.length

      if markerCount > 0
        unless undoButtonSelector.length > 0
          $('.new-polygon-container').append($('<a id="undo-vertex" class="btn btn-primary undo">Undo</a>'))
        return

    undoButtonSelector.remove()

  removeLastMarker: ->
    @polygonView.polygonDraw.removeLastMarker()
    @renderUndoButton()

  removeNewPolygonView: ->
    if @polygonView?
      @polygonView.close()
      delete @polygonView

  deleteArea: (event) ->

  render: =>
    @$el.html(@template(area: @area))
    area_results_view = new Backbone.Views.AreaResultsView(area: @area).render().$el
    @$el.find('#area_results').html(area_results_view)
    this

  onClose: ->
    @removeNewPolygonView()
    Pica.config.map.off('draw:polygon:add-vertex', @renderUndoButton)
    @area.off('change', @render)
