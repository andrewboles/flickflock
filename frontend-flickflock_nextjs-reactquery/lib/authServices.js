import axios from "axios";

let token = null;
let refreshToken = null;


const setTokens = (newToken, newRefreshToken) => {
  token = `bearer ${newToken}`;
  refreshToken = newRefreshToken;
};

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const loginService = async (credentials) => {
  const response = await axios.post(baseUrl + "/auth/login", credentials, {
    withCredentials: true,
  });
  setTokens(response.data.accessToken, response.data.refreshToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return response.data;
};


const registerService = async (credentials) => {
  const response = await axios.post(baseUrl + "/auth/register", credentials, {
    withCredentials: true,
  });
  setTokens(response.data.accessToken, response.data.refreshToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);
  return response.data;
};

const logoutService = async () => {
  const response = await axios.post(
    baseUrl + "/auth/logout",
    { refreshToken: refreshToken },
    { headers: { Authorization: token }, withCredentials: true }
  );
  localStorage.setItem("logout", Date.now());
  localStorage.setItem("refreshToken", null);
  setTokens(null, null);
  return response.data;
};

const checkUsernameInDb = async (username) => {
  const response = await axios.post(baseUrl + "/auth/checkUsername", {
    desiredUsername: username,
  });
  return response.data.exists;
};
const updateUsername = async (username) => {
  const response = await axios.post(
    baseUrl + "/auth/updateUsername",
    { desiredUsername: username },
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const getUserAndPostsWithUsername = async (username) => {
  const response = await axios.get(
    baseUrl + `/users/getUserAndPostsWithUsername/` + username
  );
  return response.data;
};

const getPost = async (postId) => {
  const response = await axios.get(baseUrl + "/posts/" + postId);
  return response.data;
};

const createComment = async ({ postRef, commentText, id }) => {
  const response = await axios.post(
    baseUrl + "/posts/" + postRef + "/createComment",
    { commentText, id },
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const removeComment = async (commentId) => {
  const response = await axios.delete(
    baseUrl + "/posts/removeComment/" + commentId,
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const addHeart = async (newHeart) => {
  const response = await axios.post(
    baseUrl + "/posts/" + newHeart.postId + "/addHeart",
    {},
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const removeHeart = async (postId) => {
  const response = await axios.delete(
    baseUrl + "/posts/" + postId + "/removeHeart",
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const createPost = async postUrl => {
  const response = await axios.post(
    baseUrl + "/posts/createPost",
    {postUrl},
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response;
}

const getHomePosts = async (pageKey) => {
  const response = await axios.get(baseUrl + "/posts/home" + pageKey, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data;
};

const getFeedPosts = async (pageKey) => {
  const response = await axios.get(baseUrl + "/posts/feed" + pageKey, {
    headers: { Authorization: token },
    withCredentials: true,
  });
  return response.data;
};

/* const addHeartHome = async (postId, otherPosts) => {
  const response = await axios.post(
    baseUrl + "/posts/" + postId + "/addHeart",
    {},
    { headers: { Authorization: token }, withCredentials: true }
  );
  const final = [response.data, ...otherPosts];
  final = [final.sort((b, a) => a.createdAt.localeCompare(b.createdAt))];
  return final;
};

const removeHeartHome = async (postId, otherPosts) => {
  const response = await axios.delete(
    baseUrl + "/posts/" + postId + "/removeHeart",
    { headers: { Authorization: token }, withCredentials: true }
  );
  const final = [response.data, ...otherPosts];
  final = [final.sort((b, a) => a.createdAt.localeCompare(b.createdAt))];
  return final;
}; */

const followUser = async (newFollow) => {
  const response = await axios.post(
    baseUrl + "/users/" + newFollow.followingId + "/follow",
    { newFollow },
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const unfollowUser = async (userId) => {
  const response = await axios.post(
    baseUrl + "/users/" + userId + "/unfollow",
    {},
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};
const addCommentHeart = async (newCommentHeart) => {
  const response = await axios.post(
    baseUrl + "/posts/" + newCommentHeart.commentId + "/addCommentHeart",
    {},
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const removeCommentHeart = async (commentId) => {
  const response = await axios.delete(
    baseUrl + "/posts/" + commentId + "/removeCommentHeart",
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

const deletePost = async (postId) => {
  const response = await axios.delete(
    baseUrl + "/posts/" + postId + "/deletePost",
    { headers: { Authorization: token }, withCredentials: true }
  );
  return response.data;
};

export {
  createPost,
  followUser,
  unfollowUser,
  addHeart,
  removeComment,
  removeHeart,
  createComment,
  getPost,
  token,
  setTokens,
  loginService,
  registerService,
  logoutService,
  checkUsernameInDb,
  updateUsername,
  getUserAndPostsWithUsername,
  getHomePosts,
  getFeedPosts,
  addCommentHeart,
  removeCommentHeart,
  deletePost
};
