class Habitat
  extend ActiveModel::Naming

  attr_reader :name

  def self.all
    %w(mangrove seagrass sabkha saltmarsh algal_mat other).map { |n| new(n) }
  end

  def self.find(param)
    all.detect { |h| h.to_param == param } || raise(ActiveRecord::RecordNotFound)
  end

  def initialize(name)
    @name = name
  end

  def to_param
    @name
  end

  def table_name
    table_str = "bc_#{name}"
    unless Rails.env == "production"
      table_str += "_#{Rails.env}"
    end
    table_str
  end

  # Returns a link to CartoDB to retrieve a shapefile download of the
  # current state of the habitats
  def self.shapefile_export_url table_name = ''
    api_key = CARTODB_CONFIG['api_key']

    query = []

    if table_name.blank?
      Habitat.all.each do |habitat|
        query << generate_shapefile_export_query(habitat.table_name) 
      end
      query = query.join(" UNION ALL ")
    else
      query = generate_shapefile_export_query("bc_#{table_name}_development")
    end
    puts query
    "http://carbon-tool.cartodb.com/api/v2/sql?q=#{URI.encode(query)}&format=shp&api_key=#{api_key}"
  end

  def self.generate_shapefile_export_query table_name
    "SELECT the_geom, habitat FROM #{table_name}"
  end


end
