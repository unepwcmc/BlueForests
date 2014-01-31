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
    "I am in the AreaResultsView initializer!"
    @area = options.area
    @textDirection = @getTextDirection()
    @area.app.on('syncStarted', @render)
    @area.app.on('syncFinished', @render)


  humanEmissionsAsTime: (timeInYears) ->
    timeInDays = roundToDecimals(timeInYears * 365, 2)
    timeInYears = roundToDecimals(timeInYears, 2)
    if timeInYears < 1
      return "#{timeInDays} <span>#{polyglot.t('analysis.days')}</span>"
    return "#{timeInYears} <span>#{polyglot.t('analysis.years')}</span>"


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
          results.habitats[polyglot.t("analysis.#{habitat.habitat}")] ||= {}
          results.habitats[polyglot.t("analysis.#{habitat.habitat}")][operation] = habitat[operation]

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
        background: "#fff"
        borderColor: "#384658"
        #showOn: "creation"  # For debugging
        className: @getTextDirection()
      new Opentip(el, value, options)

