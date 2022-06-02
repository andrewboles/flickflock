/* eslint-disable global-require */
/* eslint-disable quotes */
const { db } = require("../utils/db");

exports.createPost = async (req, res, next) => {
  const { userId } = req.payload;
  const { postUrl } = req.body;
  try {
    await db.post.create({
      data: {
        authorId: userId,
        downloadUrl: postUrl,
      },
    });
    res.send({ postCreate: "success" });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postDoc = await db.post.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        _count: {
          select: { hearts: true, comments: true },
        },
        hearts: true,
        author: {
          include: {
            username: true,
          },
        },
        comments: {
          include: {
            User: {
              include: {
                username: true,
              },
            },
            CommentHearts: true,
            _count: {
              select: { commentHearts: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    res.send(postDoc);
  } catch (err) {
    next(err);
  }
};

exports.createComment = async (req, res, next) => {
  const { userId } = req.payload;
  const { commentText, id } = req.body;
  const postId = req.params.id;
  try {
    const comment = await db.comment.create({
      data: {
        id,
        userId,
        postId,
        comment: commentText,
      },
      include: {
        User: {
          include: {
            username: true,
          },
        },
        CommentHearts: true,
        _count: {
          select: { CommentHearts: true },
        },
      },
    });
    res.send(comment);
  } catch (err) {
    next(err);
  }
};

exports.removeComment = async (req, res, next) => {
  const { userId } = req.payload;
  const commentId = req.params.id;
  try {
    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
        userId,
      },
    });
    if (!comment) {
      res.send({ commentDelete: "failure" });
    }
    await db.comment.delete({
      where: {
        id: commentId,
      },
    });

    res.send({ commentDelete: "success" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.addHeart = async (req, res, next) => {
  const postId = req.params.id;
  const { userId } = req.payload;
  try {
    const heart = await db.heart.create({
      data: {
        postId,
        userId,
      },
    });
    res.send(heart);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.removeHeart = async (req, res, next) => {
  const postId = req.params.id;
  const { userId } = req.payload;
  try {
    const { id } = await db.heart.findFirst({
      where: {
        postId,
        userId,
      },
    });
    await db.heart.delete({
      where: {
        id,
      },
    });

    res.send({ heartDelete: "success" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getHomePosts = async (req, res, next) => {
  const { page, limit } = req.query;
  const pageVal = Number(page);
  const limitVal = Number(limit);
  const { userId } = req.payload;
  let skipValue = 0;
  if (page === 0) {
    skipValue = 0;
  } else {
    skipValue = pageVal * limitVal;
  }

  try {
    const posts = await db.post.findMany({
      skip: skipValue,
      take: limitVal,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { hearts: true, comments: true },
        },
        hearts: true,
        author: {
          include: {
            username: true,
            followers: {
              where: {
                followerId: userId,
              },
            },
          },
        },
        comments: {
          include: {
            User: {
              include: {
                username: true,
              },
            },
            CommentHearts: true,
            _count: {
              select: { CommentHearts: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    res.send(posts);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getFeedPosts = async (req, res, next) => {
  const { page, limit, username } = req.query;
  const pageVal = Number(page);
  const limitVal = Number(limit);
  const { userId } = req.payload;
  let skipValue = 0;
  if (page === 0) {
    skipValue = 0;
  } else {
    skipValue = pageVal * limitVal;
  }

  try {
    const posts = await db.post.findMany({
      skip: skipValue,
      take: limitVal,
      where: {
        author: {
          username: {
            username,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { hearts: true, comments: true },
        },
        hearts: true,
        author: {
          include: {
            username: true,
            followers: {
              where: {
                followerId: userId,
              },
            },
          },
        },
        comments: {
          include: {
            User: {
              include: {
                username: true,
              },
            },
            CommentHearts: true,
            _count: {
              select: { CommentHearts: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    res.send(posts);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.addCommentHeart = async (req, res, next) => {
  const commentId = req.params.id;
  const { userId } = req.payload;
  try {
    const commentHeart = await db.commentHeart.create({
      data: {
        commentId,
        userId,
      },
    });
    res.send(commentHeart);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.removeCommentHeart = async (req, res, next) => {
  const commentId = req.params.id;
  const { userId } = req.payload;
  try {
    const { id } = await db.commentHeart.findFirst({
      where: {
        commentId,
        userId,
      },
    });
    await db.commentHeart.delete({
      where: {
        id,
      },
    });

    res.send({ heartDelete: "success" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.id;
  const { userId } = req.payload;
  try {
    const { id } = await db.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    });
    await db.post.delete({
      where: {
        id,
      },
    });

    res.send({ postDelete: "success" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
