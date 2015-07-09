require 'fileutils'

class Mbtile < ActiveRecord::Base
  belongs_to :area
  after_create { MbtileGenerator.perform_async(id) }

  def self.generate(area_id, habitat)
    where(area_id: area_id, habitat: habitat).first_or_create.generate
  end

  def completed?
    status == 'complete'
  end

  def last_validation_updated_at
    area.validations.select(:updated_at).order('updated_at DESC').first.try(:updated_at)
  end

  def already_generated?
    return false unless last_generation_started_at && last_validation_updated_at
    last_generation_started_at > last_validation_updated_at
  end
end
