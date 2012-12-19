class CartodbQuery
  def self.query(table_name, geom, validation)
    uniq_id = (Time.now.to_f * 1000.0).to_i

    <<-SQL
UPDATE #{table_name} AS t SET toggle = NULL WHERE ST_Intersects(#{geom},t.the_geom) AND t.toggle = true;

INSERT INTO #{table_name} (the_geom, action, admin_id, age, area_id, density, knowledge, notes, phase, phase_id, prev_phase, toggle)
  SELECT ST_Multi(ST_Intersection(#{geom}, t.the_geom)) AS the_geom, '#{validation.action}', #{validation.admin_id}, #{validation.age}, #{validation.area_id}, #{validation.density}, '#{validation.knowledge}', '#{validation.notes}', #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
  UNION ALL
  SELECT ST_Multi(ST_Difference(t.the_geom, ST_Collect(#{geom}))) AS the_geom, t.action, t.admin_id, t.age, t.area_id, t.density, t.knowledge, t.notes, #{uniq_id}, t.phase_id, t.prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
    GROUP BY t.the_geom, t.action, t.admin_id, t.age, t.area_id, t.density, t.knowledge, t.notes, t.phase, t.phase_id, t.prev_phase
  UNION ALL
  SELECT ST_Multi(ST_Difference(dt.polygon, ST_Collect(t.the_geom))) AS the_geom, '#{validation.action}', #{validation.admin_id}, #{validation.age}, #{validation.area_id}, #{validation.density}, '#{validation.knowledge}', '#{validation.notes}', #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t, (SELECT #{geom} AS polygon) dt
    WHERE ST_Overlaps(t.the_geom, dt.polygon)
    GROUP BY t.phase, dt.polygon;

INSERT INTO #{table_name}
  (the_geom, action, admin_id, age, area_id, density, knowledge, notes, phase, phase_id, toggle)
  SELECT ST_Multi(dt.polygon) AS the_geom, '#{validation.action}', #{validation.admin_id}, #{validation.age}, #{validation.area_id}, #{validation.density}, '#{validation.knowledge}', '#{validation.notes}', #{uniq_id}, 1, true
    FROM (SELECT #{geom} AS polygon) dt
    WHERE (SELECT COUNT(1) FROM #{table_name} t, (SELECT #{geom} AS polygon) dt WHERE ST_Overlaps(t.the_geom, dt.polygon) AND toggle IS NULL) = 0;

UPDATE #{table_name} SET toggle = false WHERE toggle IS NULL;
    SQL
  end
end
