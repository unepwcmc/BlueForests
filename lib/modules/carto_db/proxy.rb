module CartoDb::Proxy
  def self.new_map habitat, opts={}
    CartoDb::Proxy::Map.create habitat, opts
  end
end
