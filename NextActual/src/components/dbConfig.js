// dbConfig.js 
//de producción: 
/*
const dbConfig = {
  user: 'socoucpmanager',
  password: 'UcPDd.2o23',
  server: 'bd-ucpcobranzaprod.database.windows.net',
  database: 'UcpCobranza-prod',
  options: {
    encrypt: true, // Para conexiones seguras
  },
};
*/
//de qa:
// dbConfig.js
const dbConfig = {
  user: 'socoucpmanager',
  password: 'UcPDd.2o23',
  server: 'bd-ucpcobranzaqa.database.windows.net',
  database: 'UcpCobranza-qa',
  options: {
    encrypt: true, // Para conexiones seguras
  },
};

export default dbConfig;