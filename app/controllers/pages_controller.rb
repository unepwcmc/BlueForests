class PagesController < ApplicationController
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
end