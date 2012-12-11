BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends BlueCarbon.Views.Validations.FormView
  template: JST["backbone/templates/validations/new"]

  events:
    "click #save" : "save"
    "click #type label": "actionChange"

  constructor: (options) ->
    super(options)

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset('radio-group')
    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location.hash = "/"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )
