class Validation < ActiveRecord::Base
  attr_accessor :photo_ids

  serialize :coordinates

  belongs_to :area
  belongs_to :user
  has_many :photos

  validates :coordinates, presence: true
  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
  validates :habitat, presence: true, inclusion: { in: Habitat.all.map { |h| h.to_param } }
  validates :condition, presence: true, unless: Proc.new { |v| v.action == 'delete' || v.habitat == 'seagrass' || v.habitat == 'sabkha' || v.habitat == 'saltmarsh' || v.habitat == 'algal_mat' || v.habitat == 'other' }
  validates :user, presence: true

  before_create do
    if coordinates.kind_of?(Array)
      self.coordinates = "#{coordinates}"
    end
  end

  after_create :upload_to_carto_db
  after_update :upload_edits_to_carto_db

  after_save do
    MbtileGenerator.perform_async(area_id, habitat) if area_id

    # Reset associated photos
    unless photo_ids.nil?
      Photo.update_all("validation_id = NULL", ["id IN (?)", (photos.map(&:id) - photo_ids)])
    end

    # Associate uploaded photos
    #Photo.update_all(["validation_id = ?", id], ["id IN (?)", photo_ids])
  end

  def self.undo_most_recent_by_habitat(habitat)
    validation = Validation.most_recent(habitat)

    if validation.present? && validation.destroy
      # Undo the most recent validation
      sql = CartodbQuery.remove(CartoDb.table_name(habitat))
      validation.cartodb_query(sql)
    end
  end

  def self.most_recent(habitat)
    Validation.
      where(["habitat = ?", habitat]).
      order("id DESC").
      first
  end

  def json_coordinates
    if coordinates.kind_of?(Array)
      json_coordinates = coordinates
    else
      json_coordinates = JSON.parse(coordinates)
    end
    json_coordinates << json_coordinates.first

    json_coordinates = json_coordinates.to_s.gsub(", ", " ")
    json_coordinates = json_coordinates.gsub("] [", ", ")
    json_coordinates = json_coordinates.gsub(/(\[)|(\])/, "")

    json_coordinates
  end

  def country
    area.try(:country) || user.try(:country)
  end

  def upload_to_carto_db
    CartoDb::Validation.create self
  end

  def upload_edits_to_carto_db
    CartoDb::Validation.edit self
  end
end
