module PagesHelper
  SHARED_TEXT = 'Measuring Carbon Stocks'
  def hero_text country
    country_affix = country ? "in #{country.name.capitalize}" : 'Worldwide'
    subtitle = content_tag(:h2, "#{SHARED_TEXT} #{country_affix}")

    content_tag(:h1, 'Blue Forests') + subtitle
  end

  def country_flag country
    return nil unless country

    flag = content_tag(:i, '', class: "flag-icon flag-icon-#{country.iso.downcase}")
    name = content_tag(:span, country.name.capitalize)

    content_tag(:div, flag + name, class: 'flag-and-name')
  end
end
