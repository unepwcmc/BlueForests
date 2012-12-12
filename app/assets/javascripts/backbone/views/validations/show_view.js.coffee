BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ShowView extends Backbone.View
  template: JST["backbone/templates/validations/show"]

  render: ->
    $(@el).html(@template(@model.toJSON() ))
    return this
