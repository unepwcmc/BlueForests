require 'spec_helper'
require_relative '../../lib/cartodb_query'

describe CartodbQuery do
  describe '.query' do
    before(:all) do
      require 'ostruct'
      @phase = (Time.now.to_f * 1000.0).to_i
      @phase2 = (Time.now.to_f * 1000.0 * 2).to_i
      @phase3 = (Time.now.to_f * 1000.0 * 3).to_i
      @addition = OpenStruct.new(id: 1, action: 'add', admin_id: 1, age: 1, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test')
      @editing = OpenStruct.new(id: 1, admin_id: 1, age: 1234, area_id: 1, density: 1, knowledge: 'local_data', notes: 'test', id: @phase)
    end


    describe 'when there is one geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((-12 -8, -8 -8, -8 -12, -12 -12, -12 -8)))', 4326), true, #{@phase}, #{@phase}, #{@phase});"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.editing('geometries', @editing)
        ActiveRecord::Base.connection.execute(query)

        puts add_query, query
      end

      it 'gets 1 more geometry with age 1234' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age = 1234;")
        Integer(check['count']).should ==(1)
      end

    end




    describe 'when there are two geometries that not intersect' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true, #{@phase}, #{@phase}, #{@phase});"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle, phase, prev_phase, edit_phase) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true, #{@phase2}, #{@phase2}, #{@phase2});"
        ActiveRecord::Base.connection.execute(add_query2)

        query = CartodbQuery.editing('geometries', @editing)

        ActiveRecord::Base.connection.execute(query)
      end

      it 'gets 1 more geometry with age 1234' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age = 1234;")
        Integer(check['count']).should ==(1)
      end

      it 'gets 1 more geometry with age null' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE age is null;")
        Integer(check['count']).should ==(1)
      end
    end

=begin

    describe 'when there is a geometry that intersects previous adding geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query2)

      end

      it 'creates 11 more geometries (total of 18)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(18)
      end

      it 'changes 5 (of 7) geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(7)
      end

      it 'adds the 11 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(11)
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


        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 5 more geometries (total of 8)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(8)
      end

      it 'changes 2 geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(2)
      end

      it 'adds the 5 new geometries with toggle => true and keeps 1' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(6)
      end
    end

    describe 'when there is a geometry that intersects previous editing geometry and another that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query3)


        query1 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 4, 0 4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query1)

        query2 = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query2)
      end

      it 'creates 11 more geometries (total of 19)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(19)
      end

      it 'changes 5 (of 7) geometries to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(7)
      end

      it 'adds the 11 new geometries with toggle => true and keeps 1' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(12)
      end
    end

    describe 'when there are two geometries that intersect and another null that does not' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((-2 2, 2 2, 2 -2, -2 -2, -2 2)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        add_query2 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((3 3, 7 3, 7 7, 3 7, 3 3)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query2)

        add_query3 = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((13 13, 17 13, 17 17, 13 17, 13 13)))', 4326), null);"
        ActiveRecord::Base.connection.execute(add_query3)


        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((-1 3.5, 6 3.5, 6 1, -1 1, -1 3.5)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)

      end

      it 'creates 5 more geometries (total of 8)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(8)
      end

      it 'changes 3 geometries to toggle => false including null values' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(3)
      end

      it 'adds the 5 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(5)
      end

      it 'adds the a new geometries with toggle => false and notes' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false and notes IS NOT NULL;")
        Integer(check['count']).should ==(1)
      end
    end

        describe 'when intersects the same geometry' do
      before(:each) do
        add_query = "INSERT INTO geometries (the_geom, toggle) VALUES (ST_GeomFromText('MULTIPOLYGON(((0 0,4 0, 4 -4, 0 -4, 0 0)))', 4326), true);"
        ActiveRecord::Base.connection.execute(add_query)

        query = CartodbQuery.query('geometries', "ST_GeomFromText('MultiPolygon(((0 0, 4 0, 4 -4, 0 -4, 0 0)))',4326)", @addition)
        ActiveRecord::Base.connection.execute(query)
      end

      it 'creates 3 more geometries (total of 4)' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries;")
        Integer(check['count']).should ==(4)
      end

      it 'changes 1 geometry to toggle => false' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = false;")
        Integer(check['count']).should ==(1)
      end

      it 'adds the 3 new geometries with toggle => true' do
        check = ActiveRecord::Base.connection.select_one("SELECT COUNT(1) AS count FROM geometries WHERE toggle = true;")
        Integer(check['count']).should ==(3)
      end

        end
=end
  end
end
