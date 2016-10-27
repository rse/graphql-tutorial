/*
**  TechINSIGHT GraphQL: Sample Service
**  Author: Ralf S. Engelschall, msg Applied Technology Research
**
**  Stage of Extension:
**  01. just plain all-in-one GraphQL "Hello World"
*/

import util              from "util"
import * as GraphQL      from "graphql"

GraphQL.graphql(
    new GraphQL.GraphQLSchema({
        query: new GraphQL.GraphQLObjectType({
            name: "Root",
            fields: () => ({
                "Hello": {
                    type: GraphQL.GraphQLString,
                    resolve: () => { return "World" }
                }
            })
        })
    }),
    `query { Hello }`,
    null, null, {}
).then((result) => {
    console.log("OK", util.inspect(result, { depth: null, colors: true }))
}).catch((result) => {
    console.log("ERROR", result)
})

