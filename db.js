const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
  'tgBot',
  'root',
  'root',
  {
    host: '81.163.24.115',
    port: '5432',
    dialect: 'postgres'
  }
);