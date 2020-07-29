module ApplicationHelper
  def selected_link_to text, path, opts={}
    target       = Rails.application.routes.recognize_path(path)
    current_page = Rails.application.routes.recognize_path(request.path)

    opts[:class] ||= ""
    if current_page[:controller] == target[:controller]
      opts[:class] << " is-selected"
    end

    link_to text, path, opts
  end

  def gef_site_link slug, name
    "<p>See <a href=\"https://www.gefblueforests.org/project-site-locations/#{slug}-site\" title=\"Go to GEF Blue Forests - #{name}\" target=\"_blank\">here</a> for further details.</p>".html_safe
  end
end
