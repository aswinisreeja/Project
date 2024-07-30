const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('my_database', 'postgres', 'qwert@123', {
  host: 'localhost',
  dialect: 'postgres',
});

module.exports = sequelize;
