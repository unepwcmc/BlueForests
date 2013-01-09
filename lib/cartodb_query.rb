class CartodbQuery
  def self.query(table_name, geom, validation)
    uniq_id = validation.id

    if validation.action == 'delete'
      more_params = ""
      more_fields = ""
      more_groups = ""
    else
      more_params = ", age, area_id, density, knowledge, notes"
      more_fields = ", #{validation.age || '0'}, #{validation.area_id || '0'}, #{validation.density || '0'}, '#{validation.knowledge}', '#{validation.notes}'"
      more_groups = ", t.age, t.area_id, t.density, t.knowledge, t.notes"
    end

    if validation.action == 'validate'

      <<-SQL
UPDATE #{table_name} AS t SET toggle = FALSE, notes = 'null at #{uniq_id}'  WHERE t.toggle IS NULL;
UPDATE #{table_name} AS t SET toggle = NULL WHERE ST_Intersects(#{geom},t.the_geom) AND t.toggle = true AND (t.action != 'delete' OR t.action IS NULL);

INSERT INTO #{table_name} (the_geom, action, admin_id#{more_params}, phase, phase_id, prev_phase, toggle)
 SELECT ST_Multi(ST_Intersection(#{geom}, t.the_geom)) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
  UNION ALL
  SELECT ST_Multi(ST_Difference(t.the_geom, ST_Buffer(ST_Collect(#{geom}),0))) AS the_geom, t.action, t.admin_id#{more_groups}, #{uniq_id}, t.phase_id,  #{uniq_id}, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
    GROUP BY t.the_geom, t.action, t.admin_id#{more_groups}, t.phase, t.phase_id, t.prev_phase;

UPDATE #{table_name} AS t SET toggle = false WHERE toggle IS NULL;

SQL
      elsif validation.action == 'add'

     <<-SQL

UPDATE #{table_name} AS t SET toggle = FALSE, notes = 'null at #{uniq_id}'  WHERE t.toggle IS NULL;
UPDATE #{table_name} AS t SET toggle = NULL WHERE ST_Intersects(#{geom},t.the_geom) AND t.toggle = true;

INSERT INTO #{table_name} (the_geom, action, admin_id#{more_params}, phase, phase_id, prev_phase, toggle)
   SELECT ST_Multi(ST_Intersection(#{geom}, t.the_geom)) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL AND (t.action != 'validate' OR t.action IS NULL)
  UNION ALL
  SELECT ST_Multi(ST_Difference(t.the_geom, ST_Buffer(ST_Collect(#{geom}),0))) AS the_geom, t.action, t.admin_id#{more_groups}, #{uniq_id}, t.phase_id, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL AND (t.action != 'validate' OR t.action IS NULL)
    GROUP BY t.the_geom, t.action, t.admin_id#{more_groups}, t.phase, t.phase_id, t.prev_phase
    UNION ALL
  SELECT ST_Multi(ST_Difference(dt.polygon, ST_Buffer(ST_Collect(t.the_geom),0))) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, #{uniq_id}, true
    FROM #{table_name} t, (SELECT #{geom} AS polygon) dt
    WHERE ST_Intersects(t.the_geom, dt.polygon) AND t.toggle IS NULL
    GROUP BY dt.polygon;

INSERT INTO #{table_name}
  (the_geom, action, admin_id#{more_params}, phase, phase_id, toggle)
  SELECT ST_Multi(dt.polygon) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, true
    FROM (SELECT #{geom} AS polygon) dt
    WHERE (SELECT COUNT(1) FROM #{table_name} t, (SELECT #{geom} AS polygon) dt WHERE ST_Intersects(t.the_geom, dt.polygon) AND toggle IS NULL) = 0;


UPDATE #{table_name} AS t SET toggle = true WHERE toggle IS NULL AND action = 'validate';
UPDATE #{table_name} AS t SET toggle = false WHERE toggle IS NULL;

    SQL

    elsif validation.action == 'undo'

      <<-SQL

UPDATE #{table_name} as t SET toggle = true FROM (SELECT b.the_geom FROM 
    (SELECT max(phase) as max_phase, prev_phase, the_geom FROM #{table_name}  WHERE toggle = true GROUP BY prev_phase, the_geom HAVING max(phase) = (SELECT max(phase) FROM #{table_name})) a, 
    (SELECT phase, the_geom FROM #{table_name}  WHERE toggle = false) b
    WHERE a.prev_phase = b.phase AND ST_Intersects(a.the_geom, b.the_geom) GROUP by b.the_geom
    ) c
  WHERE t.the_geom = c.the_geom AND toggle = false ;
DELETE FROM #{table_name} AS t
  WHERE t.phase
IN (SELECT max(phase) as max_phase FROM #{table_name}) AND toggle = true;

      SQL

    else
      <<-SQL
UPDATE #{table_name} AS t SET toggle = FALSE, notes = 'null at #{uniq_id}'  WHERE t.toggle IS NULL;
UPDATE #{table_name} AS t SET toggle = NULL WHERE ST_Intersects(#{geom},t.the_geom) AND t.toggle = true;

INSERT INTO #{table_name} (the_geom, action, admin_id#{more_params}, phase, phase_id, prev_phase, toggle)
  SELECT ST_Multi(ST_Intersection(#{geom}, t.the_geom)) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, t.phase AS prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
  UNION ALL
  SELECT ST_Multi(ST_Difference(t.the_geom, ST_Buffer(ST_Collect(#{geom}),0))) AS the_geom, t.action, t.admin_id#{more_groups}, #{uniq_id}, t.phase_id, t.prev_phase, true
    FROM #{table_name} t
    WHERE t.toggle IS NULL
    GROUP BY t.the_geom, t.action, t.admin_id#{more_groups}, t.phase, t.phase_id, t.prev_phase
    UNION ALL
  SELECT ST_Multi(ST_Difference(dt.polygon, ST_Buffer(ST_Collect(t.the_geom),0))) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1,  #{uniq_id}, true
    FROM #{table_name} t, (SELECT #{geom} AS polygon) dt
    WHERE ST_Intersects(t.the_geom, dt.polygon) AND t.toggle IS NULL
    GROUP BY t.phase, dt.polygon;

INSERT INTO #{table_name}
  (the_geom, action, admin_id#{more_params}, phase, phase_id, toggle)
  SELECT ST_Multi(dt.polygon) AS the_geom, '#{validation.action}', #{validation.admin_id}#{more_fields}, #{uniq_id}, 1, true
    FROM (SELECT #{geom} AS polygon) dt
    WHERE (SELECT COUNT(1) FROM #{table_name} t, (SELECT #{geom} AS polygon) dt WHERE ST_Intersects(t.the_geom, dt.polygon) AND toggle IS NULL) = 0;

UPDATE #{table_name} AS t SET toggle = false WHERE toggle IS NULL;
SQL
    end
  end
end
