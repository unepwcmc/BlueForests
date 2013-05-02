BlueCarbon.Views.Validations ||= {}

class BlueCarbon.Views.Validations.IndexView extends Backbone.View
  template: JST["backbone/templates/validations/index"]

  events: 
    "click .delete": "delete"

  initialize: () ->
    @options.validations.bind('reset', @addAll)

  addAll: () =>
    @options.validations.each(@addOne)

  addOne: (validation) =>
    #console.log @collection.isLatest(validation)
    view = new BlueCarbon.Views.Validations.ValidationView(
      model: validation
      collection: @collection
    )
    @$("tbody").append(view.render().el)

  render: =>
    $(@el).html(@template(validations: @options.validations.toJSON(true) ))
    @addAll()

    @$("table").dataTable
      sDom: "<'row'<'span6'l><'span6'f>r>t<'row'<'span6'i><'span6'p>>"
      sPaginationType: "bootstrap"
      oLanguage:
        sLengthMenu: "_MENU_ records per page"
      aaSorting: [[0, 'desc']]
      aoColumns: [
        null,
        null,
        null,
        null,
        { "bSearchable": false, "bSortable": false },
        { "bSearchable": false, "bSortable": false }
        { "bSearchable": false, "bSortable": false }
      ]

    return this

  delete: (e) ->
    id = $(e.target).attr("id").split("_")[0]
    validation = @collection.get(id)
    validation.destroy({wait: true})
    validation.on "sync", =>
      @render()