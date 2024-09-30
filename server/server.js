const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express'); 
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
const routes = require('./routes');
const { authMiddleware } = require('./utils/auth'); 

const startApolloServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Set up Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      // Use the Middleware to get user from token
      const { user } = authMiddleware(req); 
      return { user };
    },
  });

  await server.start(); 
  server.applyMiddleware({ app }); 

  // Middleware 
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static files from the React frontend in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }

  // For RESTful routes
  app.use(routes);

  // Start the database connection and the Express server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on http://localhost:${PORT}`);
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Initialize Apollo and start the server
startApolloServer();