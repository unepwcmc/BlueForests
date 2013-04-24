window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.PolyActionsView extends Backbone.View
  template: JST['poly_actions']

  events:
    'click .delete-polygon': 'deletePolygon'

  initialize: (options) ->
    @area = options.area
    @polygon = options.polygon
    @event   = options.event
    @callback = options.success || () ->

    @render()

  deletePolygon: (event) ->
    @polygon.destroy(
      success: () =>
        @onClose()
        @area.sync(
          success: @callback
        )
    )

  render: =>
    $('.delete-polygon').remove()
    @$el.html(@template(coords: {x: @event.containerPoint.x, y: @event.containerPoint.y}))

    $('body').append(@$el)
    $('body').on('click', @onClose)

    return @

  onClose: =>
    $('body').find(@$el).remove()
