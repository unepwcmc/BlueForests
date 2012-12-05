class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()

    # Validations are passed in through the Rails template to remove the
    # need for a second coming, I mean, loading.
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

    @map_view = new BlueCarbon.Views.Validations.MapView(model: validation)
