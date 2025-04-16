const { Sequelize } = require("sequelize");
require("dotenv").config();

if (!process.env.DB_URL) {
  console.error("ERROR: No se encontró la variable DB_URL en .env");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: "postgres",
  logging: false,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL exitosamente.");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
    process.exit(1);
  }
})();

module.exports = sequelize;
