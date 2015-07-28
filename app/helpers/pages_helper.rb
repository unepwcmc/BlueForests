module PagesHelper
  SHARED_TEXT = 'Measuring Carbon Stocks'
  def hero_text country
    country_affix = country ? "in #{country.name.capitalize}" : 'Worldwide'
    subtitle = content_tag(:h2, "#{SHARED_TEXT} #{country_affix}")

    content_tag(:h1, 'Blue Forests') + subtitle
  end
end
