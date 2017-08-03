// Global policy for usernames and branch names.
const policy = /^[a-z_-]+$/;

const Validator = {
  namePolicy(string) {
    return policy.test(string);
  }
};

export default Validator;
