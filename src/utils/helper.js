const isAdmin = (member) =>
  member.roles.cache.some((role) => role.id === process.env.VERIFIER_ROLE_ID);

module.exports = {
  isAdmin,
};
