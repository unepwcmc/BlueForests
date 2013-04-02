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

  deleteArea: (event) ->
    

  render: =>
    @$el.html(@template(area: @area))
    return @

  onClose: ->
    @removeNewPolygonView()
    @showAreaPolygonsView.close()
    @area.off('sync', @render)
