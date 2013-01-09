BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.EditView extends Backbone.View
  template : JST["backbone/templates/validations/edit"]

  constructor: (options) ->
    super(options)
    @areas = options.areas

    @model.bind "change:errors", (model, errors) =>
      if errors?
        $("form#edit-validation").prepend("<div class='alert alert-error'>Something went wrong. Please check the form before submitting again.</div>")

        _.each @model.get('errors'), (errors, name) ->
          if name == 'action'
            $("form #control-group-action").after("<div id='action-error' class='control-group error'><span class='help-block error'>Action #{errors[0]}</span></div>")
          else if name == 'coordinates'
            $("#map").after("<div id='map-error' class='control-group error'><span class='help-block error'>Coordinates #{errors[0]}</span></div>")
          else
            $("form [name=#{name}]").parents('.control-group').addClass('error').find('label').append("<span class=\"error\"> #{errors[0]}</span>")

  events :
    "submit #edit-validation" : "update"

  update : (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")
    $("form .alert, #map-error, #action-error").remove()
    $('form .control-group').removeClass('error').find('label span.error').remove()

    @model.save(null,
      success : (validation) =>
        @model = validation
        window.location.hash = "/#{@model.id}"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render : ->
    $(@el).html(@template({validation: @model.toJSON(), areas: @areas }))

    this.$("form").backboneLink(@model)

    # Action btn-group
    this.$(".btn-group button[data-action='#{@model.get('action')}']").removeClass('btn-primary').addClass('btn-inverse active')

    this.$(".btn-group button").click (e) ->
      $("#action").val($(e.target).data('action')).trigger('change')

    return this
