class CartoDb::Validation

  def self.create validation
    new(validation, validation.action).run
  end

  def self.edit validation
    new(validation, 'edit').run
  end

  def initialize validation, action
    @validation = validation
    @action = action
  end

  def run
    CartoDb.query(query)
  end

  private

  attr_reader :validation

  def query
    ERB.new(template).result(binding).squish
  end

  def template
    File.read(CartoDb::TEMPLATES_PATH.join("#{@action}.sql.erb"))
  end

  def table_name
    CartoDb.table_name(@validation.habitat)
  end

  def view_name
    CartoDb.view_name(@validation.habitat, @validation.country)
  end
end
