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
  validates :habitat, presence: true
  validates :density, presence: true
  validates :age, presence: true
  validates :admin, presence: true

  before_create :cartodb

  after_save do
    Mbtile.delay.generate(area_id, habitat)
  end

  def cartodb
    geom_sql = "ST_GeomFromText('MULTIPOLYGON(((#{coordinates})))', 4326)"

    # SQL CartoDB
    sql = <<-SQL
      INSERT INTO #{APP_CONFIG['cartodb_table']} (the_geom)
        SELECT
         ST_Multi(CASE WHEN existing_validations.the_geom IS NOT NULL THEN 
           ST_Difference(
             ST_GeomFromText('MULTIPOLYGON(((36.560096740722656 -18.550416726315852,36.56816482543945 -18.563435634003167,36.58069610595703 -18.55155592038031,36.560096740722656 -18.550416726315852)))', 4326),
             ST_Multi(existing_validations.the_geom))
         ELSE
           ST_GeomFromText('MULTIPOLYGON(((36.560096740722656 -18.550416726315852,36.56816482543945 -18.563435634003167,36.58069610595703 -18.55155592038031,36.560096740722656 -18.550416726315852)))', 4326)
         END) FROM (
         SELECT ST_Union(the_geom) as the_geom
         FROM #{APP_CONFIG['cartodb_table']}
         WHERE ST_Intersects(ST_GeomFromText('MULTIPOLYGON(((36.560096740722656 -18.550416726315852,36.56816482543945 -18.563435634003167,36.58069610595703 -18.55155592038031,36.560096740722656 -18.550416726315852)))', 4326), the_geom)
        ) as existing_validations;
    SQL

    CartoDB::Connection.query sql
  rescue CartoDB::Client::Error
    errors.add :base, 'There was an error trying to render the layers.'
    logger.info "There was an error trying to execute the following query:\n#{sql}"
  end
end
