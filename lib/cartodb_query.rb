class CartodbQuery
  def self.query(table_name, geom, validation)
    uniq_id = (Time.now.to_f * 1000.0).to_i

    if validation.action == 'delete'
      more_params = ""
      more_fields = ""
      more_groups = ""
    else
      more_params = ", age, area_id, density, knowledge, notes"
      more_fields = ", #{validation.age}, #{validation.area_id}, #{validation.density}, '#{validation.knowledge}', '#{validation.notes}'"
      more_groups = ", t.age, t.area_id, t.density, t.knowledge, t.notes"
    end

    if validation.action == 'validate'
      sql_part = ';'
    else
      sql_part = <<-SQL
  UNION ALL
  SELECT ST_Multi(ST_Difference(t.the_geom, ST_Collect(#{geom}))) AS the_geom, t.action, t.admin_id#{more_groups}, #{uniq_id}, t.phase_id, t.prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
    GROUP BY t.the_geom, t.action, t.admin_id#{more_groups}, t.phase, t.phase_id, t.prev_phase
  UNION ALL
  SELECT ST_Multi(ST_Difference(dt.polygon, ST_Collect(t.the_geom))) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t, (SELECT #{geom} AS polygon) dt
    WHERE ST_Overlaps(t.the_geom, dt.polygon)
    GROUP BY t.phase, dt.polygon;

INSERT INTO #{table_name}
  (the_geom, action, admin_id#{more_params}, phase, phase_id, toggle)
  SELECT ST_Multi(dt.polygon) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, true
    FROM (SELECT #{geom} AS polygon) dt
    WHERE (SELECT COUNT(1) FROM #{table_name} t, (SELECT #{geom} AS polygon) dt WHERE ST_Overlaps(t.the_geom, dt.polygon) AND toggle IS NULL) = 0;
      SQL
    end

    <<-SQL
UPDATE #{table_name} AS t SET toggle = NULL WHERE ST_Intersects(#{geom},t.the_geom) AND t.toggle = true;

INSERT INTO #{table_name} (the_geom, action, admin_id#{more_params}, phase, phase_id, prev_phase, toggle)
  SELECT ST_Multi(ST_Intersection(#{geom}, t.the_geom)) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
#{sql_part}

UPDATE #{table_name} SET toggle = false WHERE toggle IS NULL;
    SQL
  end
end
