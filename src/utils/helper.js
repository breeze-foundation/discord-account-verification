const isAdmin = (member) =>
  member.roles.cache.some((role) => role.id === process.env.VERIFIER_ROLE_ID);

const isModerator = (member) => 
  member.roles.cache.some((role) => role.id === process.env.MODERATOR_ROLE_ID);

module.exports = {
  isAdmin,
  isModerator
};
