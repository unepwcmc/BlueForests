class AnalysisController < ApplicationController
  layout :get_layout_from_params

  def index
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
end
