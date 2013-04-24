window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaView extends Backbone.View
  template: JST['area']

  events:
    'click #delete-area': 'deleteArea'

  initialize: (options) ->
    @area = options.area
    #@area.on('change', @render)

    @render()

  deleteArea: (event) ->
    

  render: =>
    @$el.html(@template())

    area_controls_view = new Backbone.Views.AreaControlsView(area: @area).render().$el
    @$el.find('#area_controls').html(area_controls_view)

    return @
