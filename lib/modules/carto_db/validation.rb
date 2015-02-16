class CartoDb::Validation
  BASE_PATH = Rails.root.join('lib', 'modules', 'carto_db', 'templates')

  def self.create validation
    new(validation).create
  end

  def initialize validation
    @validation = validation
  end

  def create
    CartoDb.query(query)
  end

  private

  attr_reader :validation

  def query
    ERB.new(template).result(binding).squish
  end

  def template
    File.read(BASE_PATH.join("#{validation.action}.sql.erb"))
  end

  def table_name
    Habitat.find(@validation.habitat).table_name
  end
end
