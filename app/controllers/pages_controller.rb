class PagesController < ApplicationController
  layout 'pages'
  
  def about
    @bg_colour = "white"
    @background = "matted"
    @active = "about"
  end

  def home
    @bg_colour = "grey"
    @background = ""
    @active = "home"
  end
end