// Global policy for usernames and branch names.
const policy = /^[a-z0-9_-]+$/;

const Validator = {
  namePolicy(string) {
    return policy.test(string);
  },

  passwordPolicy(string) {
    return string && string.length >= 6 && string.length <= 30;
  },

  usernamePolicy(string) {
    return policy.test(string);
  },
};

export default Validator;
