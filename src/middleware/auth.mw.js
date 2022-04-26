module.exports = {
  checkProxyAuth: (req, res, next) => {
    const proxyAuthHeader = req.headers["proxy-authorization"];
    if (!proxyAuthHeader)
      return res.status(407).json({
        error: { status: 407, message: "MUST PROVIDE A PROXY AUTH PASSWORD" },
      });

    const proxyAuthPassword = proxyAuthHeader.replace("Basic ", "");
    const { PROXY_PASSWORD_1, PROXY_PASSWORD_2, PROXY_PASSWORD_3 } =
      process.env;
    const proxyAuthPasswords = {
      [PROXY_PASSWORD_1]: true,
      [PROXY_PASSWORD_2]: true,
      [PROXY_PASSWORD_3]: true,
    };
    if (!proxyAuthPasswords[proxyAuthPassword])
      return res.status(407).json({
        error: { status: 407, message: "INCORRECT PROXY AUTH PASSWORD" },
      });

    next();
  },
};
