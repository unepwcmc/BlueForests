class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()

    # Validations are passed in through the Rails template to remove the
    # need for a second coming, I mean, loading.
    @validations.reset options.validations

    @viewManager = new Backbone.ViewManager('#validations')

  routes:
    "new"      : "new"
    "index"    : "index"
    ":id"      : "show"
    ".*"        : "index"

  new: ->
    view = new BlueCarbon.Views.Validations.NewView(collection: @validations)
    @viewManager.showView(view)

    @map_view = new BlueCarbon.Views.Validations.MapView(model: validation)

  index: ->
    view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    @viewManager.showView(view)

  show: (id) ->
    validation = @validations.get(id)

    view = new BlueCarbon.Views.Validations.FormView(model: validation)
    @viewManager.showView(view)

    @map_view = new BlueCarbon.Views.Validations.MapView(model: validation)
