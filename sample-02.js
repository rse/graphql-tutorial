/*
**  TechINSIGHT GraphQL: Sample Service
**  Author: Ralf S. Engelschall, msg Applied Technology Research
**
**  Stage of Extension:
**  01. just plain all-in-one GraphQL "Hello World"
**  02. replaces GraphQL schema API calls with GraphQL schema definition language
*/

import util              from "util"
import * as GraphQL      from "graphql"
import * as GraphQLTools from "graphql-tools"

GraphQL.graphql(
    GraphQLTools.makeExecutableSchema({
        typeDefs: [`
            schema    { query: Root }
            type Root { Hello: String }
        `],
        resolvers: {
            "Root": { "Hello": () => "World" }
        }
    }),
    `query { Hello }`,
    null, null, {}
).then((result) => {
    console.log("OK", util.inspect(result, { depth: null, colors: true }))
}).catch((result) => {
    console.log("ERROR", result)
})

