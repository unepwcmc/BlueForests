module CartoDb::Proxy::Map
  def self.create habitat, opts={}
    sql = sql(habitat, opts[:country], opts[:where])
    cartocss = opts[:style] if opts[:style]

    carto_response = CartoDb.post(
      maps_url,
      body: mapconfig_json(sql, cartocss),
      headers: {'Content-Type' => 'application/json'}
    )
    extract_tiles_url(carto_response.body)
  end

  private

  def self.extract_tiles_url response
    info = JSON.parse(response)
    tiles_path = URI.escape("/api/v1/map/#{info["layergroupid"]}/{z}/{x}/{y}.png")

    CartoDb.build_url(tiles_path, with_api_key: false)
  end

  def self.mapconfig_json sql, cartocss
    mapconfig_template.result(binding).squish
  end

  def self.mapconfig_template
    @@mapconfig_template ||= ERB.new(
      File.read(CartoDb::TEMPLATES_PATH.join('mapconfig.json.erb'))
    )
  end

  def self.maps_url
    CartoDb.build_url("/api/v1/map")
  end

  def self.sql habitat, country, where
    parts = "SELECT * FROM #{source(habitat)}"
    parts << " WHERE country_id = '#{country.iso}'"
    parts << " AND #{where}" if where
    parts
  end

  def self.source habitat
    CartoDb.table_name(habitat)
  end
end
