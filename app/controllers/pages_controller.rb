class PagesController < ApplicationController
  before_filter :set_locale
  layout 'pages'

  def about
    @bg_colour = "white"
    @background = "matted"
    @active = "about"
  end

  def help
    @bg_colour = "white"
    @background = "matted"
    @active = "help"
  end

  def home
    @bg_colour = "grey"
    @background = ""
    @active = "home"
  end

  def set_locale
    I18n.locale = params[:locale] || I18n.default_locale
  end

  def default_url_options(options={})
    logger.debug "default_url_options is passed options: #{options.inspect}\n"
    { :locale => I18n.locale }
  end
end
