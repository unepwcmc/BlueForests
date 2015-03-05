module CartoDb::Proxy
  def self.tile habitat, coords, opts={}
    query = {sql: sql(habitat, opts[:country], opts[:where])}
    query[:style] = opts[:style] if opts[:style]

    url = tiles_url(CartoDb.table_name(habitat), coords, query)
    CartoDb.get(url).body
  end

  private

  def self.tiles_url table, coords, opts
    coords = [:z, :x, :y].map(&coords.method(:[])).join('/')
    CartoDb.build_url("/tiles/#{table}/#{coords}.png", opts)
  end

  def self.sql habitat, country, where
    [].tap { |parts|
      parts << 'SELECT *'
      parts << "FROM #{source(habitat, country)}"
      parts << "WHERE #{where}" if where
    }.join(' ')
  end

  def self.source habitat, country
    if country
      CartoDb.view_name(habitat, country)
    else
      CartoDb.table_name(habitat)
    end
  end
end
