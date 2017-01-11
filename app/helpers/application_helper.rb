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
end
