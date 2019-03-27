module.exports = (sequelize, DataTypes) => {
  const Estados = sequelize.define(
    'Estados',
    {
      gid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      id: DataTypes.BIGINT,
      id_0: DataTypes.BIGINT,
      id_1: DataTypes.BIGINT,
      name_0: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        field: 'name_1',
      },
      geom: DataTypes.GEOMETRY('MultiPolygon', 4326),
    },
    {
      tableName: 's_estados',
      timestamps: false,
    },
  );

  Estados.associate = (models) => {
    models.Estados.belongsTo(models.Paises, {
      foreignKey: 'id_1',
    });
  };

  return Estados;
};
