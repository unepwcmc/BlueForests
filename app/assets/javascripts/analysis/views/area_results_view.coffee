window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaResultsView extends Backbone.View
  template: JST['area_results_view']

  events:
    'click .share': 'toggleSharePopover'

  TOOLTIP_DATA:
    tot_area_tip: polyglot.t("analysis.tooltips.tot_area_tip")
    ca_stock_tip: polyglot.t("analysis.tooltips.ca_stock_tip")
    co2_pc_emis_tip: polyglot.t("analysis.tooltips.co2_pc_emis_tip")
    habitat_tip: polyglot.t("analysis.tooltips.habitat_tip")

  getTextDirection: ->
    if polyglot.locale() == "en"
      return "ltr"
    "rtl"

  initialize: (options) ->
    @area = options.area
    @textDirection = @getTextDirection()
    @area.app.on('syncStarted', @render)
    @area.app.on('syncFinished', @render)


  resultsToObj: ->
    if @area.get('results')? && @area.get('results').length > 0
      results =
        sum: {}
        orderedHabitats: []
      habitatResults = {}

      compareByName = (name) ->
        (obj) ->
          obj.display_name == name

      getResultByName = (name) =>
        _.find(@area.get('results'), compareByName(name)).value

      getOrderedHabitats = (results) ->
        orderedHabitatNames = ['Mangroves', 'Seagrasses', 'Saltmarshes', 'Algal Mats']
        habitats = []
        
        _.each orderedHabitatNames, (name) ->
          if results[name]
            habitats.push(results[name])
        
        return habitats

      values =
        carbon: getResultByName("Carbon")
        area_km2: getResultByName("Area")
        habitat_percentage: getResultByName("Percentage of Habitats")

      _.each values, (habitats, operation) ->
        _.each habitats, (habitat) ->
          # TODO actually remove other from calculations
          return if "#{habitat.habitat}" is 'null' or "#{habitat.habitat}" is 'other'
          habitatResults[polyglot.t("analysis.#{habitat.habitat}")] ||= {}
          habitatResults[polyglot.t("analysis.#{habitat.habitat}")][operation] = habitat[operation]
          habitatResults[polyglot.t("analysis.#{habitat.habitat}")].habitat = polyglot.t("analysis.#{habitat.habitat}")

      results.sum.area = getResultByName("Total Area")
      results.sum.carbon = getResultByName("Total Carbon")
      results.orderedHabitats = getOrderedHabitats(habitatResults)

      return results
    else
      return {}


  toggleSharePopover: ->
    $('.permalink').toggle()

    $('body').on('click', (e) ->
      unless $(e.target).hasClass('share') or $('.permalink').has(e.target).length > 0
        $('.permalink').hide()
    )


  render: =>
    @$el.html(@template(area: @area, results: @resultsToObj()))
    this


  onClose: ->
    @area.off('change', @render)
