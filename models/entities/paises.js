module.exports = (sequelize, DataTypes) => {
  const Paises = sequelize.define(
    'Paises',
    {
      gid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      id: DataTypes.BIGINT,
      id_0: DataTypes.BIGINT,
      name: {
        type: DataTypes.STRING,
        field: 'name_0',
      },
      continente: DataTypes.BIGINT,
      geom: DataTypes.GEOMETRY('MultiPolygon', 4326),
    },
    {
      tableName: 's_paises',
      timestamps: false,
    },
  );

  return Paises;
};
