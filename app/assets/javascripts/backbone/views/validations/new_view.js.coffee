BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.NewView extends Backbone.View
  template: JST["backbone/templates/validations/new"]

  events:
    "click #save": "save"

  constructor: (options) ->
    super(options)
    @model = new @collection.model()

    @model.bind("change:errors", () =>
      this.render()
    )

    @form = new Backbone.Form(
      model: @model
    ).render()

    @form.on('action:change', (form, element) =>
      @actionChange(form, element)
    )

  actionChange: (form, element) ->
    @polygonDraw.disable()  if @polygonDraw?
    BlueCarbon.Map.removeLayer @polygon  if @polygon?

    $target = $(element.el)

    @polygonDraw = new L.Polygon.Draw(BlueCarbon.Map, {})
    @polygonDraw.enable()

    text = $target.find('input:checked').siblings().text()

    @model.set('action', text.toLowerCase())

  save: (e) ->
    e.preventDefault()
    e.stopPropagation()

    @model.unset("errors")

    @collection.create(@model.toJSON(),
      success: (validation) =>
        @model = validation
        window.location.hash = "/"

      error: (validation, jqXHR) =>
        @model.set({errors: $.parseJSON(jqXHR.responseText)})
    )

  render: ->
    $(@el).html(@template(@model.toJSON()))
    $(@el).find('#form').html(@form.el)

    this.$("form").backboneLink(@model)

    return this
