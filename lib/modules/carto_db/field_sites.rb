module CartoDb::FieldSites
  # Temporary logic to skip work in progress tables or non existing ones
  COUNTRIES_TO_IGNORE = %w(mozambique).freeze
  SUFFIX = 'study_sites'.freeze

  SCHEMA_NAME = CartoDb::USERNAME.freeze

  TABLE_NAME = "blueforests_field_sites_2020_#{Rails.env}".freeze

  def self.import
    unless source_tables_exist?
      Rails.logger.info('Some source tables are missing!')
      return false
    end

    if table_exists?
      Rails.logger.info("#{TABLE_NAME} already exists! Skipping...")
      return false
    end

    create_table
  end

  def self.drop_table
    CartoDb.query("DROP TABLE #{TABLE_NAME};")
  end

  private

  def self.source_tables_exist?
    query = <<-SQL
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name LIKE '%#{SUFFIX}' AND table_schema = '#{SCHEMA_NAME}'
    SQL

    carto_response = CartoDb.query(query)
    if carto_response['error'].present? || carto_response['rows'].blank?
      Rails.logger.info(carto_response['error'] || 'No rows returned!')
      return false
    end

    carto_tables = carto_response['rows'].map { |r| r['table_name'] }
    tables_diff = tables_used - carto_tables

    return true if tables_diff.empty?

    Rails.logger.info('The following tables are missing from CARTO: ')
    Rails.logger.info(tables_diff.join(','))

    false
  end

  def self.table_exists?
    query = <<-SQL
      SELECT EXISTS(
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = '#{TABLE_NAME}'
      )
    SQL

    CartoDb.query(query)
  end

  def self.create_table
    create_field_sites_table
    sanitise_data_tables
    copy_data
  end

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

  # The privacy of the generated table needs to be changed later
  # unless the table already exists and it's public or public with link
  def self.create_field_sites_table
    query = <<-SQL
      CREATE TABLE IF NOT EXISTS #{TABLE_NAME}(
        the_geom GEOMETRY NOT NULL,
        name VARCHAR,
        country_id VARCHAR(2) NOT NULL
      );

      SELECT cdb_cartodbfytable('#{SCHEMA_NAME}', '#{TABLE_NAME}');
    SQL

    res = CartoDb.query(query)
    return if check_for_carto_errors(res)

    res['rows'].first['exists']
  end

  # Some tables do not have a name column
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

  DUMMY_NAME = "'No name provided #' || cartodb_id || ' for '".freeze
  def self.copy_data
    countries_used.each do |c|
      country_iso = c.iso
      res = CartoDb.query(
        <<-SQL
          INSERT INTO #{TABLE_NAME}(the_geom, name, country_id)
          SELECT the_geom, COALESCE(name, #{DUMMY_NAME} || '#{country_iso}'), '#{country_iso}' AS country_id
          FROM #{get_table_name(c)}
        SQL
      )

      check_for_carto_errors(res)
    end
  end

  def self.check_for_carto_errors(carto_response)
    if carto_response['error'].present?
      Rails.logger.info(carto_response['error'])
      return true
    end
    false
  end
end
