class AnalysisController < ApplicationController
  before_filter :set_locale
  layout :get_layout_from_params

  def index
    @phrases = I18nRepo::ANALYSIS
  end

  private

  def get_layout_from_params
    return 'iframe' if params[:layout] =~ /iframe/i
    return 'application'
  end

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end

  def default_url_options(options={})
    {:locale => I18n.locale}
  end
end
