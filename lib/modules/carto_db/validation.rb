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
    render @action
  end

  def render name, opts={}
    Rails.logger.info name
    Rails.logger.info opts

    ERB.new(template(name)).result(binding).squish
  end

  def template name
    File.read(CartoDb::TEMPLATES_PATH.join("#{name}.sql.erb"))
  end

  def table_name
    CartoDb.table_name(@validation.habitat)
  end

  def view_name
    CartoDb.view_name(@validation.habitat, @validation.country)
  end
end
