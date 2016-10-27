/*
**  TechINSIGHT GraphQL: Sample Service
**  Author: Ralf S. Engelschall, msg Applied Technology Research
**
**  Stage of Extension:
**  01. just plain all-in-one GraphQL "Hello World"
**  02. replaces GraphQL schema API calls with GraphQL schema definition language
**  03. split GraphQL usage into distinct parts
**  04. replace "Hello World" with an entity "OrgUnit" and enable schema/resolver warnings
**  05. add "Person" entity and use a separate data store
**  06. factor out resolver functionality into generic data access object functions
*/

/*  external requirements  */
import util              from "util"
import * as GraphQL      from "graphql"
import * as GraphQLTools from "graphql-tools"

/*  the particular underlying data  */
let data = {
    OrgUnit: [
        {   id: "msg", name: "msg systems ag",
            director: "HZ", members: [ "HZ", "JS" ] },
        {   id: "XT",  name: "msg Applied Technology Research (XT)",
            director: "RSE", members: [ "RSE", "BEN", "CGU" ], parentUnit: "msg" },
        {   id: "XIS", name: "msg Information Security (XIS)",
            director: "MWS", members: [ "MWS", "BWE", "FST" ], parentUnit: "msg" }
    ],
    Person: [
        {   id: "HZ",  name: "Hans Zehetmaier",     belongsTo: "msg" },
        {   id: "JS",  name: "Jens Stäcker",        belongsTo: "msg", supervisor: "HZ"  },
        {   id: "RSE", name: "Ralf S. Engelschall", belongsTo: "XT",  supervisor: "JS"  },
        {   id: "BEN", name: "Bernd Endras",        belongsTo: "XT",  supervisor: "RSE" },
        {   id: "CGU", name: "Carol Gutzeit",       belongsTo: "XT",  supervisor: "RSE" },
        {   id: "MWS", name: "Mark-W. Schmidt",     belongsTo: "XIS", supervisor: "JS"  },
        {   id: "BWE", name: "Bernhard Weber",      belongsTo: "XIS", supervisor: "MWS" },
        {   id: "FST", name: "Florian Stahl",       belongsTo: "XIS", supervisor: "MWS" }
    ]
}

/*  the generic data access methods  */
class DAO {
    static QueryEntityAll (entity) {
        return (parent, args, ctx, info) =>
            data[entity]
    }
}

/*  the GraphQL schema definition  */
let definition = `
    schema {
        query:    Root
        mutation: Root
    }

    type Root {
        OrgUnits: [OrgUnit]!
        Persons: [Person]!
    }

    type OrgUnit {
        id: ID!
        name: String
        director: Person
        members: [Person]!
        parentUnit: OrgUnit
    }

    type Person {
        id: ID!
        name: String
        belongsTo: OrgUnit
        supervisor: Person
    }
`

/*  the GraphQL schema resolvers  */
let resolvers = {
    Root: {
        OrgUnits:   DAO.QueryEntityAll         ("OrgUnit"),
        Persons:    DAO.QueryEntityAll         ("Person")
    }
}

/*  generate executable GraphQL schema  */
let schema = GraphQLTools.makeExecutableSchema({
    typeDefs: [ definition ],
    resolvers: resolvers,
    allowUndefinedInResolve: true,
    resolverValidationOptions: {
        requireResolversForArgs:      false,
        requireResolversForNonScalar: false,
        requireResolversForAllFields: false
    }
})

/*  GraphQL query  */
let query = `
    query Example {
        OrgUnits {
            id
            name
        }
    }
`
let variables = {}
GraphQL.graphql(schema, query, null, null, variables).then((result) => {
    console.log("OK", util.inspect(result, { depth: null, colors: true }))
}).catch((result) => {
    console.log("ERROR", result)
})

