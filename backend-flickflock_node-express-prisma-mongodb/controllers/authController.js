/* eslint-disable prefer-template */
/* eslint-disable quotes */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../utils/db");
const { hashToken } = require("../utils/hashToken");
const {
  findUserByEmail,
  createUserByEmailAndPassword,
  findUserById,
  createSocialUser,
} = require("./userController");
const { generateTokens } = require("../utils/jwt");
// eslint-disable-next-line no-unused-vars
const { COOKIE_OPTIONS } = require("../utils/sendRefreshToken");

function addRefreshTokenToWhitelist({ jti, refreshToken, userId }) {
  return db.refreshToken.create({
    data: {
      id: jti,
      hashedToken: hashToken(refreshToken),
      userId,
    },
  });
}

function findRefreshTokenById(id) {
  return db.refreshToken.findUnique({
    where: {
      id,
    },
  });
}

function deleteRefreshToken(id) {
  return db.refreshToken.update({
    where: {
      id,
    },
    data: {
      revoked: true,
    },
  });
}

function revokeTokens(userId) {
  return db.refreshToken.updateMany({
    where: {
      userId,
    },
    data: {
      revoked: true,
    },
  });
}

async function usernameExists(desiredUsername) {
  const usernameDoc = await db.username.findFirst({
    where: {
      username: desiredUsername,
    },
  });

  if (usernameDoc) {
    return true;
  }
  return false;
}

exports.register = async (req, res, next) => {
  console.log("yeah");
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      res.send({ error: "Email Already in Use" });
      throw new Error("Email already in use.");
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
    delete user.password;
    /* res.json({
      accessToken,
      refreshToken,
    }); */

    res.send({ ...user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(email);
    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);
    if (!validPassword) {
      res.status(403);
      throw new Error("Invalid login credentials.");
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });
    /* sendRefreshToken(res, refreshToken); */
    delete existingUser.password;
    res.send({ ...existingUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    /* const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies; */
    if (!refreshToken) {
      res.status(400);
      throw new Error("Missing refresh token.");
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error("Unauthorized");
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user,
      jti
    );
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });
    delete user.password;
    res.send({ ...user, accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

exports.revokeRefreshTokens = async (req, res, next) => {
  try {
    const { userId } = req.body;
    await revokeTokens(userId);
    res.json({ message: `Tokens revoked for user with id #${userId}` });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  const { refreshToken } = req.body;
  const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  try {
    deleteRefreshToken(payload.jti);
    res.send({ success: true });
  } catch (err) {
    next(err);
  }
};

exports.checkUsername = async (req, res, next) => {
  const { desiredUsername } = req.body;
  try {
    const result = await usernameExists(desiredUsername);
    res.send({ exists: result });
  } catch (err) {
    next(err);
  }
};

exports.updateUsername = async (req, res, next) => {
  const { desiredUsername } = req.body;
  const { userId } = req.payload;
  try {
    await db.username.create({
      data: {
        userId,
        username: desiredUsername,
      },
    });
    const user = await findUserById(userId);
    res.send({
      ...user,
    });
    console.log(user);
  } catch (err) {
    next(err);
  }
};

exports.facebookRedirect = async (req, res, next) => {
  console.log(req.user._json.picture.data.url);
  // add profile pic url
  const fbLogin = async (existingUser) => {
    if (req.user._json.picture) {
      await db.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          profilePictureUrl: req.user._json.picture.data.url,
        },
      });
    }
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });
    delete existingUser.password;
    if (process.env.VERCEL_ENV !== "production") {
      res.cookie("data", { user: existingUser, accessToken, refreshToken });
    } else {
      console.log("sending domain specific cookie");
      res.cookie(
        "data",
        { user: existingUser, accessToken, refreshToken },
        {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: ".flickflock.xyz",
        }
      );
    }
    res.redirect(process.env.PRIMARY_FRONTEND_URL + "/socialLoginSuccess");
  };

  const fbRegister = async () => {
    const user = await createSocialUser({
      email: req.user._json.email,
      authStrategy: "facebook",
      profilePictureUrl: req.user._json.picture.data.url,
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
    delete user.password;
    if (process.env.VERCEL_ENV !== "production") {
      res.cookie("data", { user, accessToken, refreshToken });
    } else {
      res.cookie(
        "data",
        { user, accessToken, refreshToken },
        {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: ".flickflock.xyz",
        }
      );
    }
    res.redirect(process.env.PRIMARY_FRONTEND_URL + "/socialLoginSuccess");
  };

  try {
    const existingUser = await findUserByEmail(req.user._json.email);
    if (existingUser) {
      await fbLogin(existingUser);
    } else {
      await fbRegister();
    }
  } catch (err) {
    next(err);
  }
};

exports.googleRedirect = async (req, res, next) => {
  const googleLogin = async (existingUser) => {
    if (req.user._json.picture) {
      await db.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          profilePictureUrl: req.user._json.picture,
        },
      });
    }
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser, jti);
    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });
    delete existingUser.password;
    if (process.env.VERCEL_ENV !== "production") {
      res.cookie("data", { user: existingUser, accessToken, refreshToken });
    } else {
      res.cookie(
        "data",
        { user: existingUser, accessToken, refreshToken },
        {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: ".flickflock.xyz",
        }
      );
    }
    res.redirect(process.env.PRIMARY_FRONTEND_URL + "/socialLoginSuccess");
  };

  const googleRegister = async () => {
    const user = await createSocialUser({
      email: req.user._json.email,
      authStrategy: "google",
      profilePictureUrl: req.user._json.picture,
    });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
    delete user.password;
    if (process.env.VERCEL_ENV !== "production") {
      res.cookie("data", { user, accessToken, refreshToken });
    } else {
      res.cookie(
        "data",
        { user, accessToken, refreshToken },
        {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          domain: ".flickflock.xyz",
        }
      );
    }
    res.redirect(process.env.PRIMARY_FRONTEND_URL + "/socialLoginSuccess");
  };

  try {
    const existingUser = await findUserByEmail(req.user._json.email);
    if (existingUser) {
      await googleLogin(existingUser);
    } else {
      await googleRegister();
    }
  } catch (err) {
    next(err);
  }
};
