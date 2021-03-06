BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends Backbone.View
  template: JST["backbone/templates/validations/new"]

  events:
    "submit #new-validation": "save"

  constructor: (options) ->
    super(options)
    @countryIso = options.countryIso
    @model = new @collection.model()
    @areas = options.areas

    @model.bind "change:errors", (model, errors) =>
      if errors?
        $("form#new-validation").prepend("<div class='alert alert-error'>Something went wrong. Please check the form before submitting again.</div>")

        _.each @model.get('errors'), (errors, name) ->
          if name == 'action'
            $("form #control-group-action").after("<div id='action-error' class='control-group error'><span class='help-block error'>Action #{errors[0]}</span></div>")
          else if name == 'coordinates'
            $("#map").after("<div id='map-error' class='control-group error'><span class='help-block error'>Coordinates #{errors[0]}</span></div>")
          else
            $("form [name=#{name}]").parents('.control-group').addClass('error').find('label').append("<span class=\"error\"> #{errors[0]}</span>")

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")
    $("form .alert, #map-error, #action-error").remove()
    $('form .control-group').removeClass('error').find('label span.error').remove()

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location = '/validations'

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template({countryIso: @countryIso, validation: @model.toJSON(), areas: @areas }))

    this.$("form").backboneLink(@model)

    # Habitat selection
    this.$("#habitat").change (e) ->
      $(".show-with-mangrove, .show-with-seagrass, .show-with-sabkha, .show-with-saltmarsh").addClass('hidden')
      $(".show-with-#{$(e.target).val()}").removeClass('hidden')

    # Action btn-group
    this.$('input[name="action-radio"]').click (e) ->
      validationType = $(e.target).data('action')
      
      $('#action').val(validationType).trigger('change')
      $('input.submit-button').removeClass('hidden')

      if validationType == 'delete'
        $('#other-fields').addClass('hidden')
        $('.form-actions').removeClass('hidden')
      else
        $('#other-fields, .form-actions').removeClass('hidden')

    return this
