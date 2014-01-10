class AnalysisController < ApplicationController
  before_filter :set_locale
  layout :get_layout_from_params

  def index
    @phrases = {
      "analysis.buttons.draw_polygon" => I18n.t(
        "analysis.buttons.draw_polygon"),
      "analysis.buttons.draw_another_polygon" => I18n.t(
        "analysis.buttons.draw_another_polygon"),
      "analysis.delete_this_area" => I18n.t(
        "analysis.delete_this_area"),
      "analysis.area"=> I18n.t(
        "analysis.area"),
      "analysis.area_1"=> I18n.t(
        "analysis.area_1"),
      "analysis.area_2"=> I18n.t(
        "analysis.area_2"),
      "analysis.area_3"=> I18n.t(
        "analysis.area_3"),
      "analysis.area_ha"=> I18n.t(
        "analysis.area_ha"),
      "analysis.area_percentage"=> I18n.t(
        "analysis.area_percentage"),
      "analysis.c_stock"=> I18n.t(
        "analysis.c_stock"),
      "analysis.total_area"=> I18n.t(
        "analysis.total_area"),
      "analysis.total_carbon_stock"=> I18n.t(
        "analysis.total_carbon_stock"),
      "analysis.total_size_area_interest"=> I18n.t(
        "analysis.total_size_area_interest"),
      "analysis.equivalent_per_capita_CO2_emissions"=> I18n.t(
        "analysis.equivalent_per_capita_CO2_emissions"),
      "analysis.years"=> I18n.t(
        "analysis.years"),
      "analysis.days"=> I18n.t(
        "analysis.days"),
      "analysis.polygons_in_this_area"=> I18n.t(
        "analysis.polygons_in_this_area"),
      "analysis.habitat"=> I18n.t(
        "analysis.habitat"),
      "analysis.ecosystem"=> I18n.t(
        "analysis.ecosystem"),
      "analysis.mangrove"=> I18n.t(
        "analysis.mangrove"),
      "analysis.algal_mat"=> I18n.t(
        "analysis.algal_mat"),
      "analysis.seagrass"=> I18n.t(
        "analysis.seagrass"),
      "analysis.saltmarsh"=> I18n.t(
        "analysis.saltmarsh"),
      "analysis.sabkha"=> I18n.t(
        "analysis.sabkha"),
      "analysis.other"=> I18n.t(
        "analysis.other"),
      "analysis.map"=> I18n.t(
        "analysis.map"),
      "analysis.satellite"=> I18n.t(
        "analysis.satellite"),      
      "analysis.share_your_work"=> I18n.t(
        "analysis.share_your_work"),
      "analysis.export_your_report"=> I18n.t(
        "analysis.export_your_report"),
      "analysis.tooltips.tot_area_tip"=> I18n.t(
        "analysis.tooltips.tot_area_tip"),
      "analysis.tooltips.ca_stock_tip"=> I18n.t(
        "analysis.tooltips.ca_stock_tip"),
      "analysis.tooltips.co2_pc_emis_tip"=> I18n.t(
        "analysis.tooltips.co2_pc_emis_tip"),
      "analysis.tooltips.habitat_tip"=> I18n.t(
        "analysis.tooltips.habitat_tip"),
      "analysis.click.start_drawing"=> I18n.t(
        "analysis.click.start_drawing"),
      "analysis.click.continue_drawing"=> I18n.t(
        "analysis.click.continue_drawing"),
      "analysis.click.close_shape"=> I18n.t(
        "analysis.click.close_shape"),
      "analysis.empty_result"=> I18n.t(
        "analysis.empty_result")
    }
  end

  private

  def get_layout_from_params
    unless params['layout'].blank?
      if params['layout'].downcase == 'iframe'
        return "iframe"
      end
    end
    return "application"
  end

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end

  def default_url_options(options={})
    {:locale => I18n.locale}
  end
end
