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

    @$("table").dataTable
      sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>"
      sPaginationType: "bootstrap"
      oLanguage:
        sLengthMenu: "_MENU_ records per page"
      "aoColumns": [
        null,
        null,
        null,
        null,
        { "bSearchable": false, "bSortable": false },
        { "bSearchable": false, "bSortable": false }
      ]

    return this
