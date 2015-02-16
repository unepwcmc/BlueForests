class CartodbQuery
  def self.remove(table_name)

    <<-SQL
    UPDATE #{table_name} SET toggle = true FROM
(SELECT prev_phase, the_geom from #{table_name} g inner join (SELECT MAX(phase) as max_phase from #{table_name} g) a on g.phase = a.max_phase) a
        WHERE #{table_name}.phase = a.prev_phase and #{table_name}.toggle = false AND ST_Intersects(#{table_name}.the_geom, a.the_geom);
      DELETE FROM #{table_name} WHERE phase = (SELECT MAX(phase) from #{table_name});
    SQL
  end
end
