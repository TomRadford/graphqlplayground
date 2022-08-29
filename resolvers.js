const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Person = require('./models/person')
const User = require('./models/user')
const config = require('./utils/config')

const { PubSub } = require('graphql-subscriptions')
const { default: mongoose } = require('mongoose')

const pubSub = new PubSub()

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (root, args, context, info) => {
      console.log('person find')
      if (
        info.fieldNodes[0].selectionSet.selections.find((field) => {
          return field.name.value === 'friendOf'
        })
      ) {
        console.log('friends of!') //Use to solve n+1
      }
      if (!args.phone) {
        const person = Person.find({}).populate('friendOf')
        return person
      }
      return Person.find({
        phone: { $exists: args.phone === 'YES' },
      }).populate('friendOf')
    },
    findPerson: async (root, args) => Person.findOne({ name: args.name }),
    me: (root, args, context) => context.currentUser,
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      }
    },
  },
  Mutation: {
    addPerson: async (root, args, context) => {
      const { currentUser } = context
      if (!currentUser) {
        throw new AuthenticationError('User not authenticated')
      }
      const person = new Person({ ...args })
      person.friendOf = mongoose.Types.ObjectId(currentUser._id)
      try {
        await person.save()
        currentUser.friends = currentUser.friends.concat(person)
        currentUser.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      pubSub.publish('PERSON_ADDED', { personAdded: person })
      return person
    },
    editNumber: async (root, args) => {
      const person = await Person.findOne({ name: args.name })
      person.phone = args.phone
      try {
        await person.save()
      } catch (error) {
        return new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
      return person
    },
    createUser: async (root, args) => {
      const existingUser = await User.findOne({ username: args.username })
      if (existingUser) {
        return new UserInputError('Username already exists')
      }
      const passwordHash = await bcrypt.hash(args.password, 10)
      const user = new User({
        username: args.username,
        passwordHash,
      })
      return user.save().catch((e) => {
        return new UserInputError(e.message, {
          invalidArgs: args,
        })
      })
    },
    addAsFriend: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }
      const nonFriendAlready = (person) =>
        !currentUser.friends
          .map((friend) => friend.id.toString())
          .includes(person._id.toString())

      const person = await Person.findOne({ name: args.name })
      if (nonFriendAlready(person)) {
        currentUser.friends = currentUser.friends.concat(person)
      }

      await currentUser.save()

      return currentUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect =
        user === null
          ? false
          : await bcrypt.compare(args.password, user.passwordHash)
      if (!passwordCorrect) {
        throw new UserInputError('Incorret credentials')
      }
      const userForToken = {
        username: user.username,
        id: user._id,
      }
      return {
        value: jwt.sign(userForToken, config.SECRET, {
          expiresIn: 60 * 60 * 3,
        }),
      }
    },
  },
  Subscription: {
    personAdded: {
      subscribe: () => pubSub.asyncIterator(['PERSON_ADDED']),
    },
  },
}
module.exports = resolvers
