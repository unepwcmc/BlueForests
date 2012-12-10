class BlueCarbon.Routers.ValidationsRouter extends Backbone.Router
  initialize: (options) ->
    @validations = new BlueCarbon.Collections.ValidationsCollection()

    # Validations are passed in through the Rails template to remove the
    # need for a second coming, I mean, loading.
    @validations.reset options.validations

    @viewManager = new Backbone.ViewManager('#validations')
    @sidebarViewManager = new Backbone.ViewManager('#sidebar')

  routes:
    "new"      : "new"
    "index"    : "index"
    ":id"      : "edit"
    ".*"        : "index"

  new: ->
    view = new BlueCarbon.Views.Validations.DisplayView()
    @viewManager.showView(view)

    map_view = new BlueCarbon.Views.Validations.MapView()

    sidebar_view = new BlueCarbon.Views.Validations.NewView(collection: @validations)
    @sidebarViewManager.showView(sidebar_view)

  index: ->
    view = new BlueCarbon.Views.Validations.IndexView(validations: @validations)
    @viewManager.showView(view)

  edit: (id) ->
    validation = @validations.get(id)

    view = new BlueCarbon.Views.Validations.DisplayView()
    @viewManager.showView(view)

    map_view = new BlueCarbon.Views.Validations.MapView(model: validation)

    sidebar_view = new BlueCarbon.Views.Validations.EditView(model: validation)
    @sidebarViewManager.showView(sidebar_view)
