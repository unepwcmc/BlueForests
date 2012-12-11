class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()
    @areas = new BlueCarbon.Collections.AreasCollection()

    # Validations and areas are passed in through the Rails template to remove the
    # need for a second coming, I mean, loading.
    @validations.reset options.validations
    @areas.reset options.areas

    @viewManager = new Backbone.ViewManager('#validations')
    @sidebarViewManager = new Backbone.ViewManager('#sidebar')

  routes:
    "new"      : "new"
    "index"    : "index"
    ":id"      : "edit"
    ".*"        : "index"

  new: ->
    # Create the validation model here, rather than in the view, as the
    # MapView needs it
    validation = new @validations.model()

    view = new BlueCarbon.Views.Validations.DisplayView()
    @viewManager.showView(view)

    map_view = new BlueCarbon.Views.Validations.MapView(model: validation)

    sidebar_view = new BlueCarbon.Views.Validations.NewView(
      collection: @validations
      model: validation
      areas: @areas
    )
    @sidebarViewManager.showView(sidebar_view)

  index: ->
    view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    @viewManager.showView(view)

  edit: (id) ->
    validation = @validations.get(id)

    view = new BlueCarbon.Views.Validations.DisplayView()
    @viewManager.showView(view)

    map_view = new BlueCarbon.Views.Validations.MapView(model: validation)

    sidebar_view = new BlueCarbon.Views.Validations.EditView(model: validation, areas: @areas)
    @sidebarViewManager.showView(sidebar_view)
