const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const debug = require('debug')('bdqueimadas:db');
// const pg = require('pg');

const modelsDir = path.join(__dirname, './models/entities/');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Database.json'), 'utf8'));
const tables = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/Tables.json'), 'utf8'));
const attributes = JSON.parse(fs.readFileSync(path.join(__dirname, './configurations/AttributesTable.json'), 'utf8'));

const db = {};
const sequelize = new Sequelize(
  config.database,
  config.user,
  config.password,
  config,
  {
    define: {
      timestamps: false,
    },
  },
);

fs.readdirSync(modelsDir)
  .filter(
    file => file.indexOf('.') !== 0 && file.slice(-3) === '.js',
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(modelsDir, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

sequelize.authenticate()
  .then(() => {
    debug('OK. Database connected!');
  })
  .catch((err) => {
    debug('ERROR', err);
  });

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.tables = tables;
db.attributes = attributes;
db.Op = Sequelize.Op;

module.exports = db;
