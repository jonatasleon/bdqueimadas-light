module.exports = (sequelize, DataTypes) => {
  const Municipios = sequelize.define(
    'Municipios',
    {
      gid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      id: DataTypes.BIGINT,
      id_0: DataTypes.BIGINT,
      id_1: DataTypes.BIGINT,
      id_2: DataTypes.BIGINT,
      name_0: DataTypes.STRING,
      name_1: DataTypes.STRING,
      name_2: DataTypes.STRING,
      geom: DataTypes.GEOMETRY('MultiPolygon', 4326),
    },
    {
      tableName: 's_municipios',
      timestamps: false,
    },
  );

  Municipios.associate = (models) => {
    models.Municipios.belongsTo(models.Estados, {
      foreignKey: 'id_1',
    });
  };

  return Municipios;
};
