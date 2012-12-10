object @area
attributes :id, :title, :coordinates
child mbtiles: :mbtiles do
  attributes :habitat, :last_generated_at, :status

  node :url do |mbtile|
    area_mbtile_url(mbtile.area, mbtile.habitat)
  end
end
