const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).select('-__v -password');
        }

        throw new AuthenticationError('You need to be logged in!');
      },
    },
  
    Mutation: {
      addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
        return { token, user };
      },
      login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
  
        if (!user) {
          throw new AuthenticationError('No user found with this email address');
        }
  
        const correctPw = await user.isCorrectPassword(password);
  
        if (!correctPw) {
          throw new AuthenticationError('Incorrect credentials');
        }
  
        const token = signToken(user);

        return { token, user };
      },
      saveBook: async (parent, { bookData }, context) => {
        if (context.user) {
             const userSave = await User.findOneAndUpdate(
                { _id },
                { $push: { savedBooks: bookData } },
                { new: true },
            );

            return userSave;
        }
      },
      removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const deleteBook = await User.findOneAndDelete(
              { _id},
              { $pull: { savedBooks: { bookId }}},
              { new: true },
            );
        }
      }
    },
  };
  
  module.exports = resolvers;