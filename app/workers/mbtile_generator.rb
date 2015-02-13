class MbtileGenerator
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform mbtile_id
    @mbtile = Mbtile.find(mbtile_id)
    return if @mbtile.already_generated?
  end
end
