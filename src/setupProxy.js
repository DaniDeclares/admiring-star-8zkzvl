const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/printify',
    createProxyMiddleware({
      target: 'https://api.printify.com/v1',
      changeOrigin: true,
      pathRewrite: { '^/printify': '' },
      onProxyReq: (proxyReq) => {
        proxyReq.setHeader(
          'Authorization',
          `Bearer ${process.env.PRINTIFY_API_TOKEN}`
        );
      },
    })
  );
};
