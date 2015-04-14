module CartoDb::Proxy::Shapefile
  def self.download habitat, opts={}, &blk
    query = shapefile_export_query(CartoDb.table_name(habitat), opts[:country])
    Net::HTTP.get_response(download_uri(query)).body
  end

  private

  def self.download_uri query
    CartoDb.build_url('/api/v2/sql', query: {q: query, format: :shp}, as_uri: true)
  end

  def self.shapefile_export_query table_name, country
    """
      SELECT tb.the_geom, tb.habitat, cvd.density, knowledge, cvc.condition,
             cva.age, tb.capturesource, tb.ecoregion, tb.notes, interpolated, soil_geology
      FROM #{table_name} tb
      LEFT JOIN bc_density_codes cvd on cvd.density_code = tb.density
      LEFT JOIN bc_condition_codes cvc on cvc.condition_code = tb.condition
      LEFT JOIN bc_age_codes cva on cva.age_code = tb.age
      WHERE toggle = 'true' AND action <> 'delete'
    """.tap { |query|
      query << " AND country_id = '#{country.iso}'" if country
    }.squish
  end
end
