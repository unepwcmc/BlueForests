module CartoDb::Proxy
  def self.tile habitat, coords, opts={}
    query = {sql: sql(habitat, opts[:country], opts[:where])}
    query[:style] = opts[:style] if opts[:style]

    url = tiles_url(CartoDb.table_name(habitat), coords, query)
    CartoDb.get(url).body
  end

  private

  def self.tiles_url table, coords, opts
    coords = "#{coords[:z]}/#{coords[:x]}/#{coords[:y]}"
    CartoDb.build_url("/tiles/#{table}/#{coords}.png", opts)
  end

  def self.sql habitat, country, where
    parts = "SELECT * FROM #{source(habitat, country)}"
    parts << " WHERE #{where}" if where
    parts
  end

  def self.source habitat, country
    if country
      CartoDb.view_name(habitat, country)
    else
      CartoDb.table_name(habitat)
    end
  end
end
