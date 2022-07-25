type Person {
    id: ID!
    phone: String
    street: String
}

type Query {
    personCount: Int!
    allPersons: [Person!]!
    findPerson(name: String!): Person
}

// if !(!) then nullable

query {
    personCount
}

query {
    allPersons {
        name
        phone
    }
}

query {
    findPerson(name: "Tom") {
        phone
        id
    }
}
// returns:
{
    "data": {
        "findPerson": {
            phone: "65465464"
            id: "654634"
        }
    }
}

query {
    findPerson(name: "nobody") {
        id
    }
}
// returns:
{
    "data": {
        "findPerson": null
    }