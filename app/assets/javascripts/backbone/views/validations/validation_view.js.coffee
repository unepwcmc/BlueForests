BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ValidationView extends Backbone.View
  template: JST["backbone/templates/validations/validation"]

  tagName: "tr"

  render: ->
    @$el.html(@template(@model.toJSON(true) ))
    return this
