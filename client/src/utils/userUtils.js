/**
 * Safely extracts user ID from any User object or string reference.
 */
export function getUserId(user) {
  if (!user) return "";
  if (typeof user === "string") return user;
  return (user._id || user.id || "").toString();
}

/**
 * Returns the best display name for a user (username or full name).
 */
export function getUserDisplayName(user) {
  if (!user) return "User";
  return user.username || user.name || "User";
}

/**
 * Checks whether the current user is following a target user based on Redux state lists.
 */
export function isUserFollowed(targetUserId, followingList = [], signedUser = null) {
  if (!targetUserId) return false;
  const targetIdStr = targetUserId.toString();

  const inFollowingList = followingList.some(
    (item) => getUserId(item?.following || item) === targetIdStr
  );

  const inSignedUserFollowing =
    Array.isArray(signedUser?.following) &&
    signedUser.following.some((item) => getUserId(item) === targetIdStr);

  return inFollowingList || inSignedUserFollowing;
}
