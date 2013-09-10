class PagesController < ApplicationController
  layout 'pages'
  
  def about
    @bg_colour = "white"
    
  end

  def home
    @bg_colour = ""
  end
end