BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.IndexView extends Backbone.View
  template: JST["backbone/templates/validations/index"]

  initialize: () ->
    @options.validations.bind('reset', @addAll)

  addAll: () =>
    @options.validations.each(@addOne)

  addOne: (validation) =>
    view = new BlueCarbon.Views.Validations.ValidationView({model : validation})
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(validations: @options.validations.toJSON() ))
    @addAll()

    return this
