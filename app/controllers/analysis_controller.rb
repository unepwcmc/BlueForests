class AnalysisController < ApplicationController
  before_filter :set_locale
  layout :get_layout_from_params

  def index
    @phrases = {
      "analysis.buttons.draw_polygon" => I18n.t(
        "analysis.buttons.draw_polygon"),
      "analysis.buttons.draw_another_polygon" => I18n.t(
        "analysis.buttons.draw_another_polygon")
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
end
