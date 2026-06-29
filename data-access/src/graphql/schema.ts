import { gql } from 'graphql-tag';

export const typeDefs = gql`

  scalar Date
  scalar Time
  scalar DateTime
  scalar JSON

  type Organization {
    _id: ID!
    id: ID!
    orgName: String!
    username: String!
    bio: String
    orgImg: String
    createdAt: DateTime
    updatedAt: DateTime
    events(limit: Int = 25, offset: Int = 0, status: EventStatus, fromDate: Date, toDate: Date): [Event!]!
  }

  type User {
    _id: ID!
    id: ID!
    firstName: String
    lastName: String
    username: String!
    password: String!
    profileImg: String
    role: String
    organization: Organization
    organizationUsername: String
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Event {
    _id: ID!
    id: ID!
    organizationUsername: String!
    organization: Organization
    createdBy: String
    title: String!
    description: String
    eventDate: Date
    setupTime: Time
    startTime: Time
    endTime: Time
    location: String
    locationId: Int
    locationType: LocationType
    eventLevel: Int
    eventImg: String
    eventStatus: EventStatus
    formData: JSON
    submittedAt: DateTime
    createdAt: DateTime
    updatedAt: DateTime
  }

  type Location {
    _id: ID!
    id: ID!
    buildingCode: String
    buildingDisplayName: String
    roomTitle: String
    roomType: String
    maxCapacity: String
  }

  type Purchase {
    _id: ID!
    id: ID!
    organizationUsername: String!
    organization: Organization
    dateSubmitted: DateTime!
    itemTitle: String!
    itemCategory: String!
    eventId: ID!
    orderStatus: String!
    itemCost: Float!
  }

  enum EventStatus {
    DRAFT
    REVIEW
    APPROVED
    REJECTED
    CANCELLED
  }

  enum LocationType {
    ON_CAMPUS
    OFF_CAMPUS
    VIRTUAL
  }

  type Query {
    getOrganization(id: ID!): Organization
    getOrganizations(limit: Int = 25, offset: Int = 0, username: String): [Organization!]!

    getEvent(id: ID!): Event
    getEvents(limit: Int = 25, offset: Int = 0, status: EventStatus, fromDate: Date, toDate: Date): [Event!]!
    getEventsByOrganization(orgUsername: String!, limit: Int = 25, offset: Int = 0, status: EventStatus, fromDate: Date, toDate: Date): [Event!]!

    getUser(id: ID!): User
    getUsers(limit: Int = 25, offset: Int = 0, username: String): [User!]!

    getLocation(id: ID!): Location
    getLocations(limit: Int = 25, offset: Int = 0): [Location!]!

    getPurchase(id: ID!): Purchase
    getPurchases(limit: Int = 25, offset: Int = 0): [Purchase!]!
    getPurchasesByOrganization(orgUsername: String!, limit: Int = 25, offset: Int = 0): [Purchase!]!
  }

  input CreateOrganizationInput {
    orgName: String!
    username: String!
    bio: String
    orgImg: String
  }

  input UpdateOrganizationInput {
    orgName: String
    username: String
    bio: String
    orgImg: String
  }

  input CreateEventInput {
    organizationUsername: String!
    createdBy: String
    title: String!
    description: String
    eventDate: Date
    setupTime: Time
    startTime: Time
    endTime: Time
    location: String
    locationType: LocationType
    eventLevel: Int
    locationId: Int
    eventImg: String
    eventStatus: EventStatus
    formData: JSON
  }

  input UpdateEventInput {
    title: String
    description: String
    eventDate: Date
    setupTime: Time
    startTime: Time
    endTime: Time
    location: String
    locationType: LocationType
    eventLevel: Int
    locationId: Int
    eventImg: String
    eventStatus: EventStatus
    formData: JSON
  }

  input CreateUserInput {
    firstName: String
    lastName: String
    username: String!
    password: String!
    profileImg: String
    role: String
    organizationUsername: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    profileImg: String
    username: String
    password: String
    role: String
    organizationUsername: String
  }

  input CreatePurchaseInput {
    organizationUsername: String!
    dateSubmitted: DateTime!
    itemTitle: String!
    itemCategory: String!
    eventId: ID!
    orderStatus: String!
    itemCost: Float!
  }

  input UpdatePurchaseInput {
    itemTitle: String
    itemCategory: String
    eventId: ID
    orderStatus: String
    itemCost: Float
  }

  type Mutation {
    createOrganization(input: CreateOrganizationInput!): Organization!
    updateOrganization(id: ID!, input: UpdateOrganizationInput!): Organization!
    deleteOrganization(id: ID!): Boolean!

    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): Boolean!
    changeEventStatus(id: ID!, status: EventStatus!): Event!

    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    createPurchase(input: CreatePurchaseInput!): Purchase!
    updatePurchase(id: ID!, input: UpdatePurchaseInput!): Purchase!
    deletePurchase(id: ID!): Boolean!
  }
`;
