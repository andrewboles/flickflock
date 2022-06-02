/* eslint-disable quotes */
const bcrypt = require("bcrypt");
const { db } = require("../utils/db");

const findUserByEmail = async function (email) {
  return db.user.findUnique({
    where: {
      email,
    },
    include: {
      username: true,
    },
  });
};

const createUserByEmailAndPassword = async function (user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
};

const createSocialUser = async function (user) {
  return db.user.create({
    data: user,
  });
};

const findUserById = async function (id) {
  return db.user.findUnique({
    where: {
      id,
    },
    include: {
      username: true,
    },
  });
};

const getUserAndPostsWithUsername = async (req, res, next) => {
  try {
    const usernameDoc = await db.username.findUnique({
      where: {
        username: req.params.id,
      },
      include: {
        user: {
          include: {
            _count: {
              select: { hearts: true, followings: true, followers: true },
            },
            // I've only included followers and followings for the purposes of this demo.
            // I understand that this wouldn't scale for thousands, millions, etc, but this version
            // of prisma doesn't count properly for these specific relations
            followings: true,
            followers: true,
            username: true,
            posts: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });
    const { user } = usernameDoc;
    delete user.password;
    res.send(user);
  } catch (err) {
    next(err);
  }
};

const followUser = async (req, res, next) => {
  console.log("in the right ocnroller");
  const { newFollow } = req.body;
  const { followerId, followingId } = newFollow;
  try {
    const follow = await db.follows.create({
      data: {
        followerId,
        followingId,
      },
    });

    res.send(follow);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
const unfollowUser = async (req, res, next) => {
  const { userId } = req.payload;
  const followingId = req.params.id;
  try {
    const { id } = await db.follows.findFirst({
      where: {
        followerId: userId,
        followingId,
      },
    });
    await db.follows.delete({
      where: {
        id,
      },
    });
    res.send({ unfollowStatus: "success" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  findUserByEmail,
  followUser,
  unfollowUser,
  createUserByEmailAndPassword,
  findUserById,
  getUserAndPostsWithUsername,
  createSocialUser
};
