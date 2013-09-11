class PagesController < ApplicationController
  layout 'pages'
  
  def about
    @bg_colour = "white"
    @background = "matted"
  end

  def home
    @bg_colour = ""
    @background = ""
  end
end