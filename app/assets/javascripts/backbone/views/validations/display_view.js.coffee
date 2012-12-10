BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.DisplayView extends Backbone.View
  template: JST["backbone/templates/validations/display"]

  render: ->
    $(@el).html(@template)

    return this
