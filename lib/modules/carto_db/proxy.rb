module CartoDb::Proxy
  def self.new_map habitat, opts={}
    CartoDb::Proxy::Map.create habitat, opts
  end

  def self.download_shapefile habitat, opts={}
    CartoDb::Proxy::Shapefile.download habitat, opts
  end
end
