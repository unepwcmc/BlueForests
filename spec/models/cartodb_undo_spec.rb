require 'rails_helper'
require 'active_support'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @time = (Time.now.to_f * 1000.0).to_i
      @addition = OpenStruct.new(action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, condition: 4, knowledge: 'local_data', notes: 'test', habitat: 'mangrove', id: @time + 1000)
      @addition2 = OpenStruct.new(action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, condition: 4, knowledge: 'local_data', notes: 'test', habitat: 'mangrove', id: @time + 2000)
    end

    describe 'when the table is empty' do
      it 'stays empty' do
        query = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(query)

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(0) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when there is one geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), #{(Time.now.to_f * 1000.0).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes the geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(0)
      end
    end
    describe 'when there are 2 geometries that not intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), #{(Time.now.to_f*1000).to_i}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((0 0, 4 0, 4 4, 0 4, 0 0)))', 4326), #{(Time.now.to_f*1000).to_i+1}, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(query)
      end

      it 'removes one geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end
    end

    describe 'when there is one geometry that intersects' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-1 -1, 3 -1, 3 3, -1 3, -1 -1)))', 4326), #{@time}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)

        remove  = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(remove)
      end

      it 'stays with 1 geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end

      it 'stays with 1 geometry as true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(1)
      end
    end


    describe 'when there is one geometry that intersects 2' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{@time}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{@time} + 10, true);"
        ActiveRecord::Base.connection.execute(add_query2)


        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)

        remove  = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(remove)
      end

      it 'stays with 2 geometries' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(2)
      end

      it 'stays with 1 geometry as true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end
    end

    describe 'when there are 2 overlaying phases' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), #{@time}, true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, phase, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), #{@time} + 10, true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition2)
        ActiveRecord::Base.connection.execute(query2)

        remove = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(remove)
      end

      it 'stays with 7 geometries' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(7)
      end

      it 'stays with 5 geometries as true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end

      it 'stays with 2 geometries as false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end

    end

    describe 'when there are two geometries that intersect and another that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (phase, the_geom, toggle) VALUES (#{@time}, ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (phase, the_geom, toggle) VALUES (#{@time}, ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (phase, the_geom, toggle) VALUES (#{@time}, ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query3)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)

        remove  = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(remove)

      end

      it 'stays with 3 geometries' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(3)
      end

      it 'stays with 3 geometries to toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = TRUE;")
        Integer(check['count']).should ==(3)
      end
     end

    describe 'when there is a geometry that intersects previous editing geometry and another that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (phase, the_geom, toggle) VALUES (#{@time}, ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (phase, the_geom, toggle) VALUES (#{@time}, ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (phase, the_geom, toggle) VALUES ( #{@time + 1000}, ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), false);"
        ActiveRecord::Base.connection.execute(add_query3)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition2)
        ActiveRecord::Base.connection.execute(query2)

        remove = CartodbQuery.remove('geometries')
        ActiveRecord::Base.connection.execute(remove)

      end

      it 'stays with 8 geometries' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(8)
      end

      it '3 geometries with toggle = false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(3)
      end

      it '5 geometries with toggle = true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end
    end



   end
end
