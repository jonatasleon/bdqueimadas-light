module.exports = (sequelize, DataTypes) => {
  const Biomas = sequelize.define(
    'Biomas',
    {
      gid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      __gid: DataTypes.BIGINT,
      name: {
        type: DataTypes.STRING,
        field: 'nome',
      },
      shape_area: DataTypes.NUMERIC,
      shape_len: DataTypes.NUMERIC,
      geom: DataTypes.GEOMETRY('MultiPolygon', 4326),
    },
    {
      tableName: 's_biomas',
      timestamps: false,
    },
  );

  return Biomas;
};
