const { ApolloServer, gql } = require('apollo-server');
const { createStore } = require('./src/utils');

const LaunchAPI = require('./src/datasources/launch');
const UserAPI = require('./src/datasources/user')
const store = createStore();

const typeDefs = gql`
  type Launch {
    id: ID!
    site: String
    mission: Mission
    rocket: Rocket
    isBooked: Boolean
  }

  type Rocket {
    id: ID!
    name: String
    type: String
  }
  
  type User {
    id: ID!
    email: String!
    trips: [Launch]!
  }
  
  type Mission {
    name: String
    missionPatch(size: PatchSize): String
  }
  
  enum PatchSize {
    SMALL
    LARGE
  }

  type TripUpdateResponse {
    success: Boolean!
    message: String
    launches: [Launch]
  }

  type Query {
    launches: [Launch]!
    launch(id: ID!): Launch
    me: User
  }

  type Mutation {
    bookTrips(launchIds: [ID]!): TripUpdateResponse!
    cancelTrip(launchId: ID!): TripUpdateResponse!
    login(email: String): String
  }
`;

const resolvers = {
  Query: {
    launches: (_, __, { dataSources }) =>
      dataSources.launchAPI.getAllLaunches(),
    launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById({ launchId: id }),
    me: async (_, __, { dataSources }) => dataSources.userAPI.findOrCreateUser()
  }
}

const server = new ApolloServer({ typeDefs, resolvers, dataSources: () => ({ 
  launchAPI: new LaunchAPI(),
  userAPI: new UserAPI({ store }),
}) });

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});