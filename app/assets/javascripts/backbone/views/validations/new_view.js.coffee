BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends Backbone.View
  template: JST["backbone/templates/validations/new"]

  events:
    "submit #new-validation": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()
    @areas = options.areas

    @model.bind "change:errors", (model, errors) =>
      if errors?
        _.each @model.get('errors'), (errors, name) ->
          $("form [name=#{name}]").parents('.control-group').addClass('error').find('label').append("<span class=\"error\"> #{errors[0]}</span>")

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")
    $('form .control-group').removeClass('error').find('label span.error').remove()

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template({validation: @model.toJSON(), areas: @areas }))

    this.$("form").backboneLink(@model)

    # Action btn-group
    this.$(".btn-group button").click (e) ->
      $("#action").val($(e.target).data('action')).trigger('change')

    return this
