class Validation < ActiveRecord::Base
  attr_accessible :action, :coordinates, :recorded_at, :area_id,
    :knowledge, :name, :habitat, :density, :age

  belongs_to :area
  belongs_to :admin

  validates :action, presence: true, inclusion: { in: %w(add delete validate) }
  validates :habitat, presence: true, inclusion: { in: Habitat.all.map { |h| h.to_param } }
  validates :coordinates, presence: true
  validates :knowledge, presence: true
  validates :name, presence: true
  validates :density, presence: true
  validates :age, presence: true
  validates :admin, presence: true

  before_create :cartodb

  after_save do
    Mbtile.delay.generate(area_id, habitat)
  end

  def cartodb
    # SQL CartoDB
    sql = Query.add(APP_CONFIG['cartodb_table'], coordinates, {action: self.action})

    CartoDB::Connection.query sql
  rescue CartoDB::Client::Error
    errors.add :base, 'There was an error trying to render the layers.'
    logger.info "There was an error trying to execute the following query:\n#{sql}"
  end
end
