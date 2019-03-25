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
      name: {
        type: DataTypes.BIGINT,
        field: 'name_2',
      },
      state: {
        type: DataTypes.BIGINT,
        field: 'name_1',
      },
      name_0: DataTypes.STRING,
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

    models.Municipios.belongsTo(models.Paises, {
      foreignKey: 'id_0',
    });
  };

  return Municipios;
};
