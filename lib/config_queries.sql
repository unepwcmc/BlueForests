SELECT bc_sabkha.the_geom as id, c_mg_ha
FROM bc_sabkha LEFT JOIN carbon_values
ON bc_sabkha.habitat = carbon_values.habitat;

UPDATE bc_sabkha SET area =
ST_Area(
ST_Transform(
ST_SetSRID(
the_geom
, 4326)
, 27040)
);
UPDATE bc_algal_mat SET area =
ST_Area(
ST_Transform(
ST_SetSRID(
the_geom
, 4326)
, 27040)
);
UPDATE bc_mangrove SET area =
ST_Area(
ST_Transform(
ST_SetSRID(
the_geom
, 4326)
, 27040)
);
UPDATE bc_seagrass SET area =
ST_Area(
ST_Transform(
ST_SetSRID(
the_geom
, 4326)
, 27040)
);
UPDATE bc_saltmarsh SET area =
ST_Area(
ST_Transform(
ST_SetSRID(
the_geom
, 4326)
, 27040)
);

ALTER TABLE bc_mangrove ADD COLUMN area_ha numeric;
ALTER TABLE bc_seagrass ADD COLUMN area_ha numeric;
ALTER TABLE bc_saltmarsh ADD COLUMN area_ha numeric;

UPDATE bc_saltmarsh SET area_ha = area/10000;
UPDATE bc_mangrove SET area_ha = area/10000;
UPDATE bc_sabkha SET area_ha = area/10000;
UPDATE bc_algal_mat SET area_ha = area/10000;
UPDATE bc_seagrass SET area_ha = area/10000;


CREATE VIEW bc_carbon_view AS


SELECT a.the_geom, a.habitat, c_mg_ha FROM (

    SELECT mngr.the_geom, mngr.habitat, area_ha, phase, b.c_mg_ha,b.standard_value_habitat
        FROM bc_mangrove mngr
        LEFT JOIN carbon_values b
    ON (mngr.habitat = b.habitat AND mngr.density = b.density_code AND mngr.age = b.age_code AND mngr.condition = b.condition_code)
    WHERE toggle = true and action <> 'delete' and phase <> 0 AND mngr.density IS NOT NULL AND mngr.age IS NOT NULL AND mngr.condition IS NOT NULL
   UNION ALL

    -- Saltmarsh edited values with density

    SELECT sltm.the_geom, sltm.habitat, area_ha, phase, b.c_mg_ha, b.standard_value_habitat
        FROM bc_saltmarsh sltm
        LEFT JOIN carbon_values b
    ON (sltm.habitat = b.habitat AND sltm.density = b.density_code)
    WHERE toggle = true and action <> 'delete' AND phase <> 0 AND sltm.density IS NOT NULL
      UNION ALL

    -- Seagrass edited values with density

      SELECT sgrs.the_geom, sgrs.habitat, area_ha, phase, b.c_mg_ha, b.standard_value_habitat
      FROM bc_seagrass sgrs
    LEFT JOIN carbon_values b
    ON (sgrs.habitat = b.habitat AND sgrs.density = b.density_code)
    WHERE toggle = true AND action <> 'delete' AND phase <> 0 AND sgrs.density IS NOT NULL
  ) a

  UNION ALL

  -- Mangrove, Saltmarsh and Seagrass previous polygons

  SELECT mngr.the_geom, mngr.habitat, c_mg_ha
  FROM bc_mangrove mngr
  LEFT JOIN carbon_values b
  ON mngr.habitat = b.habitat
  WHERE  (toggle = true AND action <> 'delete') AND (phase = 0 OR mngr.density IS NULL OR mngr.age IS NULL OR mngr.condition IS NULL ) AND b.standard_value_habitat = TRUE
  UNION ALL
  SELECT sltm.the_geom, sltm.habitat, c_mg_ha
    FROM bc_saltmarsh sltm
    LEFT JOIN carbon_values b
  ON sltm.habitat = b.habitat
  WHERE  toggle = true AND action <> 'delete' AND (phase = 0 OR sltm.density IS NULL) AND b.standard_value_habitat = TRUE
  UNION ALL
  SELECT sgrs.the_geom, sgrs.habitat, c_mg_ha
  FROM bc_seagrass sgrs
  LEFT JOIN carbon_values b
  ON sgrs.habitat = b.habitat
  WHERE  toggle = true and action <> 'delete' AND (sgrs.density IS NULL OR phase = 0) AND b.standard_value_habitat = TRUE
  UNION ALL
  -- Algalmat (all)

  SELECT algm.the_geom, algm.habitat, b.c_mg_ha
    FROM bc_algal_mat algm
  LEFT JOIN carbon_values b
  ON (algm.habitat = b.habitat)
  WHERE toggle = true AND action <> 'delete'


SELECT * FROM INFORMATION_SCHEMA.views

http://carbon-tool.cartodb.com/api/v2/sql?format=shp
