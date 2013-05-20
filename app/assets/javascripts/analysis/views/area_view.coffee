window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaView extends Backbone.View
  template: JST['area']

  events:
    'click #delete-area': 'deleteArea'

  initialize: (options) ->
    @area = options.area
    #@area.on('change', @render)

    @showAreaPolygonsView = window.pica.currentWorkspace.currentArea.newShowAreaPolygonsView()
    @showAreaPolygonsView.on("polygonClick", @handlePolygonClick)


  deleteArea: (event) ->
    

  handlePolygonClick: (polygon, event) =>
    new Backbone.Views.PolyActionsView(
      polygon: polygon
      event: event
      success: @render
      area: @area
    )

  render: =>
    console.log "I am in the areaView render!"
    @$el.html(@template())
    area_controls_view = new Backbone.Views.AreaControlsView(area: @area).render().$el
    @$el.find('#area_controls').html(area_controls_view)
    this

  onClose: ->
    @showAreaPolygonsView.off("polygonClick", @handlePolygonClick)
    @showAreaPolygonsView.close()
