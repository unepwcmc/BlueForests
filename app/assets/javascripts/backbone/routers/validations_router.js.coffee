class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @validations.reset options.validations

  routes:
    "new"      : "new"
    "index"    : "index"
    ":id"      : "show"
    ".*"        : "index"

  new: ->
    @view = new BlueCarbon.Views.Validations.NewView(collection: @validations)
    $("#validations").html(@view.render().el)

  index: ->
    @view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    $("#validations").html(@view.render().el)

  show: (id) ->
    validation = @validations.get(id)

    @view = new BlueCarbon.Views.Validations.ShowView(model: validation)
    $("#validations").html(@view.render().el)
