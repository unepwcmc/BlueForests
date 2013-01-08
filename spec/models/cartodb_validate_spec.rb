require 'spec_helper'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @validation = OpenStruct.new(action: 'validate', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
      @exclusion = OpenStruct.new(action: 'delete', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
      @addition = OpenStruct.new(action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')

    end

    describe 'when the table is empty' do
      it 'does not create geometry' do
        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)

        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE action = 'delete';")
        Integer(check['count']).should ==(0)
      end
    end

    describe 'when there is one geometry that does NOT intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'keeps geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(1)
      end

      it 'keeps one with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(1)
      end

      it 'keeps one with action != validate' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND (action != 'validate' OR action IS NULL);")
        Integer(check['count']).should ==(1)
      end

    end

    describe 'when there is one geometry that intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 2 more geometries (total of 3)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(3)
      end

      it 'changes 1 geometry to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(1)
      end

      it 'adds the 2 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(2)
      end

      it 'creates 1 validated geometry' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'validate';")
        Integer(check['count']).should ==(1)
      end

      it 'creates 1 geometry not validated' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND (action != 'validate' OR action IS NULL);")
        Integer(check['count']).should ==(1)
      end

    end

    describe 'when there are two geometries that intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 4 more geometries (total of 6)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(6)
      end

      it 'changes 2 geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end

      it 'adds the 4 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(4)
      end

      it 'creates 2 validated geometries' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'validate';")
        Integer(check['count']).should ==(2)
      end

      it 'creates 2 geometries not validated' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND (action != 'validate' OR action IS NULL);")
        Integer(check['count']).should ==(2)
      end

    end

    describe 'when there are two geometries that intersect and another that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query3)


        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 4 more geometries (total of 7)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(7)
      end

      it 'changes 2 geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end

      it 'adds the 4 new geometries with toggle => true (total of 5)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end
    end

    describe 'when there are two geometries that intersect and another that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query3)


        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 4 more geometries (total of 7)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(7)
      end

      it 'changes 2 geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end

      it 'adds the 4 new geometries with toggle => true (total of 5)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end
    end
    describe 'when there is a validated geometry that intersects previous deleted geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @exclusion)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query2)

      end

      it 'creates 2 more geometries (total of 4)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(11)
      end

      it 'changes 2 (of 4) geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(4)
      end

      it 'adds the 7 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(7)
      end

      it 'adds the 2 new geometries with action validate' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'validate';")
        Integer(check['count']).should ==(2)
      end

      it 'keeps 3 geometries with action delete' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'delete';")
        Integer(check['count']).should ==(3)
      end
    end

    describe 'when there is a validated geometry that intersects previous deleted geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @exclusion)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query2)

      end

      it 'creates 4 more geometries (total of 11)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(11)
      end

      it 'changes 2 (of 4) geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(4)
      end

      it 'adds the 7 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(7)
      end

      it 'adds the 2 new geometries with action validate' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'validate';")
        Integer(check['count']).should ==(2)
      end

      it 'keeps 3 geometries with action delete' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'delete';")
        Integer(check['count']).should ==(3)
      end
    end

    describe 'when there is an add geometry that intersects previous validated geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @validation)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query2)

      end

      it 'creates 4 more geometries (total of 11)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(11)
      end

      it 'changes 4 geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(4)
      end

      it 'adds the 7 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(7)
      end

      it 'adds the 3 new geometries with action add' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'add';")
        Integer(check['count']).should ==(3)
      end

      it 'keeps 2 geometries with action validate' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true AND action = 'validate';")
        Integer(check['count']).should ==(2)
      end
    end
  end
end
