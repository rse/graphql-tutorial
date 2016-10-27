/*
**  TechINSIGHT GraphQL: Sample Service
**  Author: Ralf S. Engelschall, msg Applied Technology Research
**
**  Stage of Extension:
**  01. just plain all-in-one GraphQL "Hello World"
**  02. replaces GraphQL schema API calls with GraphQL schema definition language
**  03. split GraphQL usage into distinct parts
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
        Hello: String
    }
`

/*  the GraphQL schema resolvers  */
let resolvers = {
    Root: {
        Hello: (parent, args, ctx, info) => "World"
    }
}

/*  generate executable GraphQL schema  */
let schema = GraphQLTools.makeExecutableSchema({
    typeDefs: [ definition ],
    resolvers: resolvers
})

/*  GraphQL query  */
let query = `query { Hello }`
let variables = {}
GraphQL.graphql(schema, query, null, null, variables).then((result) => {
    console.log("OK", util.inspect(result, { depth: null, colors: true }))
}).catch((result) => {
    console.log("ERROR", result)
})

