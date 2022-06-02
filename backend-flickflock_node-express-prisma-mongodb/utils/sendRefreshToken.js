const dev = process.env.NODE_ENV !== 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev,
  signed: true,
  // eslint-disable-next-line no-eval
  maxAge: eval(process.env.REFRESH_TOKEN_EXPIRY) * 1000,
  sameSite: 'lax',
};

function sendRefreshToken(res, token) {
  res.cookie('refreshToken', token, COOKIE_OPTIONS);
}

module.exports = { sendRefreshToken, COOKIE_OPTIONS };
