module.exports = (sequelize, DataTypes) => {
  const Focos = sequelize.define(
    'Focos',
    {
      data_hora_gmt: DataTypes.DATE,
      longitude: DataTypes.DOUBLE,
      latitude: DataTypes.DOUBLE,
      geometria: DataTypes.GEOMETRY('MultiPolygon', 4326),
      satelite: DataTypes.STRING,
      id_0: DataTypes.INTEGER,
      id_1: DataTypes.INTEGER,
      id_2: DataTypes.INTEGER,
      pais: DataTypes.STRING,
      estado: DataTypes.STRING,
      bioma: DataTypes.STRING,
      bioma_id: DataTypes.INTEGER,
      foco_id: DataTypes.STRING,
      pid_d_focos: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
    },
    {
      tableName: 'd_focos',
      timestamps: false,
    },
  );

  Focos.associate = (models) => {
    models.Focos.belongsTo(models.Paises, {
      foreignKey: 'id_0',
    });

    models.Focos.belongsTo(models.Estados, {
      foreignKey: 'id_1',
    });

    models.Focos.belongsTo(models.Municipios, {
      foreignKey: 'id_2',
    });

    models.Focos.belongsTo(models.Biomas, {
      foreignKey: 'bioma_id',
    });
  };

  return Focos;
};
