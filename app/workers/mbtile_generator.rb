class MbtileGenerator
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform mbtile_id
    @mbtile = Mbtile.find(mbtile_id)
    return if @mbtile.already_generated?

    while_generating { Mbtile::Project.generate(@mbtile.habitat, @mbtile.area) }
  end

  def while_generating
    @mbtile.update_attributes(status: 'generating', last_generation_started_at: Time.now)
    yield
    @mbtile.update_attributes(status: 'complete', last_generated_at: Time.now)
  end
end
