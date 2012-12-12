BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.EditView extends Backbone.View
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

    # Action btn-group
    this.$(".btn-group button").click (e) ->
      $("#action").val($(e.target).data('action')).trigger('change')

    return this
