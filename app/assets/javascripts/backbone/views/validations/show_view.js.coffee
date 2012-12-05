BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.ShowView extends Backbone.View
  template : JST["backbone/templates/validations/edit"]

  events :
    "submit #edit-validation" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"
    )

  render : ->
    $(@el).html(@template(@model.toJSON() ))

    this.$("form").backboneLink(@model)

    return this
