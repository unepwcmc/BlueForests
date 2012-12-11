class Query
  def self.add(table_name, coordinates)
    geom_sql = "ST_GeomFromText('MULTIPOLYGON(((#{coordinates})))', 4326)"

    <<-SQL
      INSERT INTO #{table_name} (the_geom) VALUES (#{geom_sql});
    SQL
  end

  def self.deactivate_intersecting_polygons(table_name, coordinates)
    geom_sql = "ST_GeomFromText('MULTIPOLYGON(((#{coordinates})))', 4326)"

    <<-SQL
      UPDATE #{table_name} SET toggle = false WHERE ST_Intersects(#{table_name}.the_geom, #{geom_sql});
    SQL
  end
  
  def self.add_broken_polygons(table_name, coordinates)
    geom_sql = "ST_GeomFromText('MULTIPOLYGON(((#{coordinates})))', 4326)"

    <<-SQL
      INSERT INTO #{table_name} (the_geom, author, display, phase, phase_id, prev_phase, toggle, value)
        SELECT ST_Multi(ST_Intersection(#{geom_sql}, t.the_geom)) AS the_geom, 'Miguel' AS author, true AS display, 1 AS phase, 1 AS phase_id, 1 AS prev_phase, true AS toggle, 1 AS value
          FROM #{table_name} t WHERE ST_Intersects(#{geom_sql}, t.the_geom)
      UNION
        SELECT ST_Multi(ST_Difference(t.the_geom, #{geom_sql})) AS the_geom, 'Miguel' AS author, true AS display, 1 AS phase, 1 AS phase_id, 1 AS prev_phase, true AS toggle, 1 AS value
          FROM #{table_name} t WHERE ST_Intersects(#{geom_sql}, t.the_geom)
      UNION
        SELECT ST_Multi(ST_Difference(#{geom_sql}, t.the_geom)) AS the_geom, 'Miguel' AS author, true AS display, 1 AS phase, 1 AS phase_id, 1 AS prev_phase, true AS toggle, 1 AS value
          FROM #{table_name} t;
    SQL
  end
end
