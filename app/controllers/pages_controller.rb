class PagesController < ApplicationController
  before_filter :set_locale

  def help
  end

  def home
  end

  def methodology
  end

  def set_locale
    I18n.locale = I18n.default_locale
  end
end
