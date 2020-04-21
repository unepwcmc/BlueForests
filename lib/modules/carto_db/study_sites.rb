module CartoDb::StudySites
  # Temporary logic to skip work in progress tables or non existing ones
  COUNTRIES_TO_IGNORE = %w(mozambique).freeze
  SUFFIX = 'study_sites'.freeze

  SCHEMA_NAME = CartoDb::USERNAME.freeze
  CARTO_ERROR = 'No rows returned'.freeze

  TABLE_NAME = "blueforests_study_sites_#{Rails.env}".freeze
  def self.create_table
    create_study_sites_table
    sanitise_data_tables
    copy_data
  end

  def self.drop_table
    CartoDb.query("DROP TABLE #{TABLE_NAME};")
  end

  def self.tables_exist?
    query = <<-SQL
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%#{SUFFIX}' AND table_schema = '#{SCHEMA_NAME}'
    SQL

    carto_response = CartoDb.query(query)
    if carto_response['error'].present? || carto_response['rows'].blank?
      Rails.logger.info(carto_response['error'] || CARTO_ERROR)
      return false
    end

    carto_tables = carto_response['rows'].map { |r| r['table_name'] }
    tables_diff = tables_used - carto_tables

    return true if tables_diff.empty?

    Rails.logger.info('The following tables are missing from CARTO: ')
    Rails.logger.info(tables_diff.join(','))

    false
  end

  private

  def self.tables_to_ignore
    COUNTRIES_TO_IGNORE.map { |c| "#{c}_#{SUFFIX}" }
  end

  def self.tables_names
    country_names.map { |name| "#{name}_#{SUFFIX}" }
  end

  def self.tables_used
    tables_names - tables_to_ignore
  end

  def self.country_names
    Country.pluck(:subdomain)
  end

  def self.countries_used
    countries_to_ignore = COUNTRIES_TO_IGNORE.map { |c| "'#{c}'"}.join(',')
    Country.where("subdomain NOT IN (#{countries_to_ignore})")
  end

  def self.get_table_name(country)
    "#{country.subdomain}_#{SUFFIX}"
  end

  def self.create_study_sites_table
    query = <<-SQL
      CREATE TABLE IF NOT EXISTS #{TABLE_NAME}(
        the_geom GEOMETRY NOT NULL,
        id INTEGER NOT NULL,
        name VARCHAR,
        country_id VARCHAR(2) NOT NULL
      );

      SELECT cdb_cartodbfytable('#{SCHEMA_NAME}', '#{TABLE_NAME}');
    SQL

    CartoDb.query(query)
  end

  def self.sanitise_data_tables
    tables_used.each do |t|
      CartoDb.query(
        <<-SQL
          ALTER TABLE #{t}
          ADD COLUMN IF NOT EXISTS name VARCHAR;
        SQL
      )
    end
  end

  COLUMN_NAMES = %w(the_geom id name).freeze
  def self.copy_data
    column_names = COLUMN_NAMES.join(',')

    countries_used.each do |c|
      country_iso = c.iso
      CartoDb.query(
        <<-SQL
          INSERT INTO #{TABLE_NAME}(#{column_names}, country_id)
          SELECT #{column_names}, '#{country_iso}' AS country_id FROM #{get_table_name(c)}
        SQL
      )
    end
  end
end
