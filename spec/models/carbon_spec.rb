require 'spec_helper'
require_relative '../../lib/carbon_query'

describe CarbonQuery do
  describe '.query' do
    before(:all) do
      add_spatial_ref_sys = system("psql -U postgres -d bluecarbon_test -a -f /home/miguelt/postgis/postgis-2.0.2SVN/extensions/postgis/sql_bits/spatial_ref_sys.sql")
    end
    describe 'when there is one geometry that intersect' do
      before(:each) do
         puts add_query = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (1, 
          ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))'), 4326),27040))/10000, 
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"
        @query1 = "SELECT c_mg_ha*area_ha as carbon FROM carbon_view"
        @query2 = CarbonQuery.total("ST_GeomFromText('MultiPolygon(((1 1, 4 1, 4 4, 1 4, 1 1)))',4326)", "carbon_view")
        ActiveRecord::Base.connection.execute(add_query)
        ActiveRecord::Base.connection.execute(@query2)
      end

      it 'calculates a carbon value that is less than existing' do
        check =  ActiveRecord::Base.connection.select_one(@query2)
        result = ActiveRecord::Base.connection.select_one(@query1)
        Float(check["carbon"]).should < Float(result["carbon"])
      end
  end
  describe 'when there is one geometry that does not intersect' do
      before(:each) do
        #add_spatial_ref_sys = system("psql -U postgres -d bluecarbon_test -a -f /home/miguelt/postgis/postgis-2.0.2SVN/extensions/postgis/sql_bits/spatial_ref_sys.sql")
        add_query = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (1, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))'), 4326),27040))/10000,
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"
        @query2 = CarbonQuery.total("ST_GeomFromText('MultiPolygon(((3 3, 4 3, 4 4, 3 4, 3 3)))',4326)", "carbon_view")
        ActiveRecord::Base.connection.execute(add_query)
        ActiveRecord::Base.connection.execute(@query2)
      end

      it 'calculates a null carbon value' do
        check =  ActiveRecord::Base.connection.select_one(@query2)
          check["carbon"] = nil
      end
  end
  describe 'when there is a geometry that completely overlaps' do
      before(:each) do
        #add_spatial_ref_sys = system("psql -U postgres -d bluecarbon_test -a -f /home/miguelt/postgis/postgis-2.0.2SVN/extensions/postgis/sql_bits/spatial_ref_sys.sql")
        add_query = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (3, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))'), 4326),27040))/10000,
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"
        @query2 = CarbonQuery.total("ST_GeomFromText('MultiPolygon(((-1 -1, 4 -1, 4 4, -1 4, -1 -1)))',4326)", "carbon_view")
        ActiveRecord::Base.connection.execute(add_query)
        ActiveRecord::Base.connection.execute(@query2)
      end

      it 'calculates a carbon value that equals existing' do
        check =  ActiveRecord::Base.connection.select_one(@query2)
        result = ActiveRecord::Base.connection.select_one("SELECT c_mg_ha*area_ha as carbon FROM carbon_view")
        Float(check["carbon"]) == Float(result["carbon"])
      end
    end

    describe 'when there is a geometry that intersects 2 geometries' do
      before(:each) do
        #add_spatial_ref_sys = system("psql -U postgres -d bluecarbon_test -a -f /home/miguelt/postgis/postgis-2.0.2SVN/extensions/postgis/sql_bits/spatial_ref_sys.sql")
        add_query = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (3, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))'), 4326),27040))/10000,
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"
        add_query2 = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (3, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((3 3, 5 3, 5 5, 3 5, 3 3)))'), 4326),27040))/10000,
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"

        @query2 = CarbonQuery.total("ST_GeomFromText('MultiPolygon(((1 1, 5 1, 5 5, 1 5, 1 1)))',4326)", "carbon_view")
        ActiveRecord::Base.connection.execute(add_query)
        ActiveRecord::Base.connection.execute(@query2)
      end

      it 'calculates a carbon value that is less than existing' do
        check =  ActiveRecord::Base.connection.select_one(@query2)
        result = ActiveRecord::Base.connection.select_one( "SELECT SUM(c_mg_ha*area_ha) as carbon FROM carbon_view")
        Float(check["carbon"]) < Float(result["carbon"])
      end
    end

    describe 'when there is a geometry that intersects 2 geometries using habitats query' do
      before(:each) do
        #add_spatial_ref_sys = system("psql -U postgres -d bluecarbon_test -a -f /home/miguelt/postgis/postgis-2.0.2SVN/extensions/postgis/sql_bits/spatial_ref_sys.sql")
        add_query = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (3, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))'), 4326),27040))/10000,
          'Algalmat',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"
        add_query2 = "INSERT INTO carbon_view (c_mg_ha, area_ha, habitat, the_geom) VALUES (3, 
         ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromText('MULTIPOLYGON(((3 3, 5 3, 5 5, 3 5, 3 3)))'), 4326),27040))/10000,
          'Seagrass',
          ST_GeomFromText('MULTIPOLYGON(((0 0, 2 0, 2 2, 0 2, 0 0)))', 4326));"

       puts @query2 = CarbonQuery.habitat("ST_GeomFromText('MultiPolygon(((1 1, 5 1, 5 5, 1 5, 1 1)))',4326)", "carbon_view")
        ActiveRecord::Base.connection.execute(add_query)
        ActiveRecord::Base.connection.execute(@query2)
      end

      it 'calculates a carbon value that is less than existing' do
        check =  ActiveRecord::Base.connection.select_one(@query2)
        result = ActiveRecord::Base.connection.select_one("SELECT SUM(c_mg_ha*area_ha) as carbon FROM carbon_view")
        Float(check["carbon"]) < Float(result["carbon"])
      end


    end


  end
end
