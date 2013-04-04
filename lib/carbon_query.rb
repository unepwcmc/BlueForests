class CarbonQuery
  def self.total(the_geom, table_name)

      <<-SQL
      SELECT SUM(carbon) as carbon FROM
        (SELECT ST_AREA(ST_Transform(ST_SetSRID(ST_INTERSECTION(b.the_geom, a.the_geom), 4326),27040))/10000*c_mg_ha as carbon 
        FROM #{table_name} a 
        INNER JOIN 
          (SELECT #{the_geom} as the_geom) b 
        ON ST_Intersects(a.the_geom, b.the_geom)) c;
      SQL
  end

  def self.habitat(the_geom, table_name)

      <<-SQL
      SELECT habitat, SUM(carbon) as carbon FROM
        (SELECT ST_AREA(ST_Transform(ST_SetSRID(ST_INTERSECTION(b.the_geom, a.the_geom), 4326),27040))/10000*c_mg_ha as carbon, habitat 
        FROM #{table_name} a 
        INNER JOIN 
          (SELECT #{the_geom} as the_geom) b 
        ON ST_Intersects(a.the_geom, b.the_geom)) c
        GROUP BY habitat;
      SQL
  end
end
