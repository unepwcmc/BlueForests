window.Backbone ||= {}
window.Backbone.Views ||= {}

class Backbone.Views.AreaResultsView extends Backbone.View
  template: JST['area_results_view']

  events:
    'click .share': 'toggleSharePopover'

  initialize: (options) ->
    @area = options.area
    @area.on('change', @render)

    @render()

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
    return @

  onClose: ->
    @area.off('change', @render)
