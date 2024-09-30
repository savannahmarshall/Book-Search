const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

// Middleware to check for token in GraphQL context
const authMiddleware = (context) => {
  // Allows token to be sent via headers
  let token = context.req.headers.authorization || '';

  // Split the token
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  // If there is no token, return an error
  if (!token) {
    throw new Error('You have no token!');
  }

  // Verify the token and get user data out of it
  try {
    const { data } = jwt.verify(token, secret, { maxAge: expiration });
    return { user: data };
  } catch {
    console.log('Invalid token');
    throw new Error('Invalid token!');
  }
};

// Function to sign a new token
const signToken = function ({ username, email, _id }) {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
};

// Export the middleware and token signing function
module.exports = {
  authMiddleware,
  signToken,
};
