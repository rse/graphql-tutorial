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

    type Root {
        OrgUnit(id: ID): OrgUnit
        OrgUnits: [OrgUnit]!
        Person(id: ID): Person
        Persons: [Person]!
    }

    type OrgUnit {
        id: ID!
        name: String
        director: Person
        members: [Person]!
        parentUnit: OrgUnit
        create(id: ID, name: String, director: ID, members: [ID], parentUnit: ID): OrgUnit
        clone: OrgUnit
        update(name: String, director: ID, members: [ID], parentUnit: ID): OrgUnit
        delete: Boolean
    }

    type Person {
        id: ID!
        name: String
        belongsTo: OrgUnit
        supervisor: Person
        create(id: ID, name: String, belongsTo: ID, supervisor: ID): Person
        clone: Person
        update(name: String, belongsTo: ID, supervisor: ID): Person
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
let variables = {}
GraphQL.graphql(schema, query, null, null, variables).then((result) => {
    console.log("OK", util.inspect(result, { depth: null, colors: true }))
}).catch((result) => {
    console.log("ERROR", result)
})

