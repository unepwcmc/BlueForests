class MbtileGenerator
  include Sidekiq::Worker
  sidekiq_options retry: false

  def perform area_id, habitat
    Mbtile.generate area_id, habitat
  end
end
