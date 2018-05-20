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
**  07. add QueryEntityOne DAO method for querying particular objects
**  08. allow relationships to be queried and be strict on resolvers now
**  09. add remaining CRUD operations (create/clone, update, delete) to GraphQL entity types
**  10. wrap GraphQL application programming interface (API) with a remote network interface (RNI)
**  11. replace built-in client with interactive GraphQL web user interface (GraphiQL)
**  12. add descriptions to GraphQL schema for introspection inside GraphiQL
*/

/*  external requirements  */
import * as GraphQL      from "graphql"
import * as GraphQLTools from "graphql-tools"
import HAPI              from "hapi"
import HAPIGraphiQL      from "hapi-plugin-graphiql"
import Boom              from "boom"

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
    static QueryEntityOne (entity) {
        return (parent, args, ctx, info) =>
            args.id !== undefined ? data[entity].find((obj) => obj.id === args.id) : {}
    }
    static QueryEntityAll (entity) {
        return (parent, args, ctx, info) =>
            data[entity]
    }
    static QueryRelationshipOne (entity, relationship, target) {
        return (parent, args, ctx, info) =>
            parent[relationship] !== undefined ?
                data[target].find((obj) => obj.id === parent[relationship]) :
                null
    }
    static QueryRelationshipMany (entity, relationship, target) {
        return (parent, args, ctx, info) =>
            parent[relationship] !== undefined ?
                parent[relationship].map((id) => data[target].find((obj) => obj.id === id)) :
                []
    }
    static MutationCreate (entity) {
        let oid = 0
        return (parent, args, ctx, info) => {
            if (parent.id !== undefined)
                throw new Error(`method ${entity}#create only allowed in anonymous ${entity} context`)
            let obj = Object.assign({}, args)
            if (obj.id === undefined)
                obj.id = oid++
            data[entity].push(obj)
            return obj
        }
    }
    static MutationClone (entity) {
        return (parent, args, ctx, info) => {
            if (parent.id === undefined)
                throw new Error(`method ${entity}#clone only allowed in non-anonymous ${entity} context`)
            obj = Object.assign({}, parent)
            data[entity].push(obj)
            return obj
        }
    }
    static MutationUpdate (entity) {
        return (parent, args, ctx, info) => {
            if (parent.id === undefined)
                throw new Error(`method ${entity}#clone only allowed in non-anonymous ${entity} context`)
            let obj = Object.assign(parent, args)
            return obj
        }
    }
    static MutationDelete (entity) {
        return (parent, args, ctx, info) => {
            if (parent.id === undefined)
                throw new Error(`method ${entity}#clone only allowed in non-anonymous ${entity} context`)
            let idx = data[entity].findIndex((obj) => obj.id === parent.id)
            data[entity].splice(idx, 1)
            return true
        }
    }
}

/*  the GraphQL schema definition  */
let definition = `
    schema {
        query:    Root
        mutation: Root
    }

    #   The root type for entering the graph of **OrgUnit** and **Person** entities.
    #   Access a single entity by unique id or access all entities.
    type Root {
        #   Access a particular organizational unit by unique id.
        OrgUnit(id: ID): OrgUnit
        #   Access all organizational units.
        OrgUnits: [OrgUnit]!
        #   Access a particular person by unique id.
        Person(id: ID): Person
        #   Access all persons.
        Persons: [Person]!
    }

    #   The organizational unit to which **Person**s belong to.
    type OrgUnit {
        #   [ATTRIBUTE] Unique identifier of an organizational unit.
        id: ID!
        #   [ATTRIBUTE] Name of an organizational unit.
        name: String
        #   [RELATIONSHIP] **Person** having the director role of an organizational unit.
        director: Person
        #   [RELATIONSHIP] All **Person**s which are members of the organizational unit.
        members: [Person]!
        #   [RELATIONSHIP] The parent organizational unit.
        parentUnit: OrgUnit
        #   [METHOD] Create a new organization unit.
        create(id: ID, name: String, director: ID, members: [ID], parentUnit: ID): OrgUnit
        #   [METHOD] Clone an existing organization unit.
        clone: OrgUnit
        #   [METHOD] Update an existing organization unit.
        update(name: String, director: ID, members: [ID], parentUnit: ID): OrgUnit
        #   [METHOD] Delete an existing organization unit.
        delete: Boolean
    }

    #   The persons belonging to **OrgUnit**s.
    type Person {
        #   [ATTRIBUTE] Unique identifier of a person.
        id: ID!
        #   [ATTRIBUTE] Name of a person.
        name: String
        #   [RELATIONSHIP] **OrgUnit** this person belongs to.
        belongsTo: OrgUnit
        #   [RELATIONSHIP] **Person** this person is supervised by.
        supervisor: Person
        #   [METHOD] Create a new person.
        create(id: ID, name: String, belongsTo: ID, supervisor: ID): Person
        #   [METHOD] Clone an existing person.
        clone: Person
        #   [METHOD] Update an existing person.
        update(name: String, belongsTo: ID, supervisor: ID): Person
        #   [METHOD] Delete an existing person.
        delete: Boolean
    }
`

/*  the GraphQL schema resolvers  */
let resolvers = {
    Root: {
        OrgUnit:    DAO.QueryEntityOne         ("OrgUnit"),
        OrgUnits:   DAO.QueryEntityAll         ("OrgUnit"),
        Person:     DAO.QueryEntityOne         ("Person"),
        Persons:    DAO.QueryEntityAll         ("Person")
    },
    OrgUnit: {
        director:   DAO.QueryRelationshipOne   ("OrgUnit", "director",   "Person"),
        members:    DAO.QueryRelationshipMany  ("OrgUnit", "members",    "Person"),
        parentUnit: DAO.QueryRelationshipOne   ("OrgUnit", "parentUnit", "OrgUnit"),
        create:     DAO.MutationCreate         ("OrgUnit"),
        clone:      DAO.MutationClone          ("OrgUnit"),
        update:     DAO.MutationUpdate         ("OrgUnit"),
        delete:     DAO.MutationDelete         ("OrgUnit")
    },
    Person: {
        belongsTo:  DAO.QueryRelationshipOne   ("Person", "belongsTo",  "OrgUnit"),
        supervisor: DAO.QueryRelationshipOne   ("Person", "supervisor", "Person"),
        create:     DAO.MutationCreate         ("Person"),
        clone:      DAO.MutationClone          ("Person"),
        update:     DAO.MutationUpdate         ("Person"),
        delete:     DAO.MutationDelete         ("Person")
    }
}

/*  generate executable GraphQL schema  */
let schema = GraphQLTools.makeExecutableSchema({
    typeDefs: [ definition ],
    resolvers: resolvers,
    allowUndefinedInResolve: false,
    resolverValidationOptions: {
        requireResolversForArgs:      true,
        requireResolversForNonScalar: true,
        requireResolversForAllFields: false
    }
})

/*  GraphQL query  */
let query = `
    mutation AddCoCWT {
        m1: Person {
            create(
                id: "JHO",
                name: "Jochen Hörtreiter",
                belongsTo: "CoC-WT",
                supervisor: "RSE"
            ) {
                id
            }
        }
        m2: OrgUnit {
            create(
                id: "CoC-WT",
                name: "CoC Web Technologies",
                parentUnit: "XT",
                director: "JHO",
                members: [ "JHO", "RSE" ]
            ) {
                id name
            }
        }
        q1: OrgUnit(id: "CoC-WT") {
            id
            name
            director   { id name }
            parentUnit { id name }
            members    { id name }
        }
    }
`

;(async () => {
    /*  setup network service  */
    let server = new HAPI.Server({
        address:  "0.0.0.0",
        port:     12345
    })

    /*  establish the HAPI route for GraphiQL UI  */
    await server.register({
        plugin: HAPIGraphiQL,
        options: {
            graphiqlURL:      "/api",
            graphqlFetchURL:  "/api",
            graphqlFetchOpts: `{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept":       "application/json"
                },
                body: JSON.stringify(params),
                credentials: "same-origin"
            }`,
            graphqlExample: query.replace(/^\n/, "").replace(/^    /mg, "")
        }
    })

    /*  establish the HAPI route for GraphQL API  */
    server.route({
        method: "POST",
        path:   "/api",
        options: {
            payload: { output: "data", parse: true, allow: "application/json" }
        },
        handler: async (request, h) => {
            /*  determine request  */
            if (typeof request.payload !== "object" || request.payload === null)
                return Boom.badRequest("invalid request")
            let query     = request.payload.query
            let variables = request.payload.variables
            let operation = request.payload.operationName

            /*  support special case of GraphiQL  */
            if (typeof variables === "string")
                variables = JSON.parse(variables)
            if (typeof operation === "object" && operation !== null)
                return Boom.badRequest("invalid request")

            /*  create context for GraphQL resolver functions  */
            let ctx = { /* empty for this sample  */ }

            /*  execute the GraphQL query against the GraphQL schema  */
            return GraphQL.graphql(schema, query, null, ctx, variables, operation).then((result) => {
                return h.response(result).code(200)
            }).catch((result) => {
                if (typeof result === "object" && result instanceof Error)
                    result = `${result.name}: ${result.message}`
                else if (typeof result !== "string")
                    result = result.toString()
                result = { errors: [ { message: result } ] }
                return h.response(result).code(200)
            })
        }
    })

    /*  start server  */
    await server.start()
    console.log(`GraphiQL UI:  [GET]  http://${server.info.host}:${server.info.port}/api`)
    console.log(`GraphQL  API: [POST] http://${server.info.host}:${server.info.port}/api`)
})().catch((err) => {
    console.log("ERROR", err)
})

