/*
**  TechINSIGHT GraphQL: Sample Service
**  Author: Ralf S. Engelschall, msg Applied Technology Research
**
**  Stage of Extension:
**  01. just plain all-in-one GraphQL "Hello World"
**  02. replaces GraphQL schema API calls with GraphQL schema definition language
**  03. split GraphQL usage into distinct parts
**  04. replace "Hello World" with an entity "OrgUnit" and enable schema/resolver warnings
*/

/*  external requirements  */
import util              from "util"
import * as GraphQL      from "graphql"
import * as GraphQLTools from "graphql-tools"

/*  the GraphQL schema definition  */
let definition = `
    schema {
        query:    Root
        mutation: Root
    }

    type Root {
        OrgUnits: [OrgUnit]!
    }

    type OrgUnit {
        id: ID!
        name: String
    }
`

/*  the GraphQL schema resolvers  */
let resolvers = {
    Root: {
        OrgUnits: (parent, args, ctx, info) => [
            { id: "msg", name: "msg systems ag" },
            { id: "XT",  name: "msg Applied Technology Research (XT)" },
            { id: "XIS", name: "msg Information Security (XIS)" }
        ]
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

