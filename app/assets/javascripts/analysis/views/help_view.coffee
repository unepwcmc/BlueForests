window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.HelpView extends Backbone.View
  template: JST['help']

  initialize: (options) ->
    @render()

  render: ->
    $('.tabs li').removeClass('active')
    $('.tabs li.help').addClass('active')

    @$el.html(@template())

    return @
