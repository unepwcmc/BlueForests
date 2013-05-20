window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaResultsView extends Backbone.View
  template: JST['area_results_view']

  events:
    'click .share': 'toggleSharePopover'

  TOOLTIP_DATA: 
    tot_area_tip: "The total size of your Area of Interest in km2."
    ca_stock_tip: "The total above and below ground carbon stock of all project habitats with your Area of Interest."
    co2_pc_emis_tip: "A conversion of the Total Carbon Stock value of your Area of Interest to CO2, which is then represented as days/years CO2 emissions of an average UAE citizen." #,  based on (XXXXX Global Earth Initiative ?)
    habitat_tip: "Size of each habitat within your Area of Interest listed out in km2 and as a percentage of the overall habitat. Carbon stock per habitat in metric tonnes."


  initialize: (options) ->
    "I am in the AreaResultsView initializer!"
    @area = options.area
    #@area.on('change', @render) ##
    @area.app.on('syncStarted', @render)
    @area.app.on('syncFinished', @render)


  humanEmissionsAsTime: (timeInYears) ->
    timeInDays = roundToDecimals(timeInYears * 365, 2)
    timeInYears = roundToDecimals(timeInYears, 2)

    if timeInYears < 1
      return "#{timeInDays} <span>days</span>"

    return "#{timeInYears} <span>years</span>"

  resultsToObj: ->
    if @area.get('results')? && @area.get('results').length > 0
      results =
        sum: {}
        habitats: {}

      compareByName = (name) ->
        (obj) ->
          obj.display_name == name

      getResultByName = (name) =>
        _.find(@area.get('results'), compareByName(name)).value

      values =
        carbon: getResultByName("Carbon")
        area_km2: getResultByName("Area")
        habitat_percentage: getResultByName("Percentage")

      _.each values, (habitats, operation) ->
        _.each habitats, (habitat) ->
          # TODO actually remove other from calculations
          return if "#{habitat.habitat}" is 'null' or "#{habitat.habitat}" is 'other'
          results.habitats[habitat.habitat] ||= {}
          results.habitats[habitat.habitat][operation] = habitat[operation]

      results.sum.area = getResultByName("Total Area")
      results.sum.carbon = getResultByName("Total Carbon")
      results.sum.human_emissions = @humanEmissionsAsTime(getResultByName("Emissions"))

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
    if @$el.find("#tot_area_tip").length > 0 then @initializeTooltips()
    this

  onClose: ->
    @area.off('change', @render)


  initializeTooltips: ->
    _.each @TOOLTIP_DATA, (value, key, list) =>
      el = @$el.find("##{key}")
      options =
        tipJoint: "bottom"
        fixed: true
      new Opentip(el, value, options)

