const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/rest',
    createProxyMiddleware({
      target: 'http://wservicesdes.brazilsouth.cloudapp.azure.com', // Reemplaza con la URL del servicio HTTP
      changeOrigin: true,
      secure: false,
    })
  );
};
