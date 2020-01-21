class AnalysisController < ApplicationController
  before_filter :set_locale

  def index
  end

  private

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end

  def default_url_options(options={})
    {:locale => I18n.locale}
  end
end
