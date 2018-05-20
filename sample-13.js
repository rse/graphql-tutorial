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
**  13. move data into SQLite RDBMS and access it with Sequelize ORM
*/

/*  external requirements  */
import * as GraphQL      from "graphql"
import * as GraphQLTools from "graphql-tools"
import GraphQLSequelize  from "graphql-tools-sequelize"
import GraphQLTypes      from "graphql-tools-types"
import Sequelize         from "sequelize"
import HAPI              from "hapi"
import HAPIGraphiQL      from "hapi-plugin-graphiql"
import Boom              from "boom"

/*  establish database connection  */
const db = new Sequelize("./sample.db", "", "", {
    dialect: "sqlite", host: "", port: "", storage: "./sample.db",
    define: { freezeTableName: true, timestamps: false },
    operatorsAliases: false,
    logging: (msg) => { console.log("DB: " + msg) },
})
db.authenticate()

/*  the particular data schema  */
const dm = {}
dm.OrgUnit = db.define("OrgUnit", {
    id:         { type: Sequelize.STRING(3),   primaryKey: true  },
    name:       { type: Sequelize.STRING(100), allowNull:  false }
})
dm.Person = db.define("Person", {
    id:         { type: Sequelize.STRING(3),   primaryKey: true  },
    name:       { type: Sequelize.STRING(100), allowNull:  false }
})
dm.OrgUnit.belongsTo(dm.OrgUnit, { as: "parentUnit", foreignKey: "parentUnitId" })
dm.OrgUnit.hasMany  (dm.Person,  { as: "members",    foreignKey: "orgUnitId"    })
dm.OrgUnit.hasOne   (dm.Person,  { as: "director",   foreignKey: "directorId"   })
dm.Person .belongsTo(dm.Person,  { as: "supervisor", foreignKey: "personId"     })
dm.Person .belongsTo(dm.OrgUnit, { as: "belongsTo",  foreignKey: "orgUnitId"    })

/*  the particular underlying data  */
;(async function () {
    await db.sync({ force: true })
    const uMSG = await dm.OrgUnit.create({ id: "msg", name: "msg systems ag" })
    const uXT  = await dm.OrgUnit.create({ id: "XT",  name: "msg Applied Technology Research (XT)" })
    const uXIS = await dm.OrgUnit.create({ id: "XIS", name: "msg Information Security (XIS)" })
    const pHZ  = await dm.Person.create ({ id: "HZ",  name: "Hans Zehetmaier" })
    const pJS  = await dm.Person.create ({ id: "JS",  name: "Jens Stäcker" })
    const pRSE = await dm.Person.create ({ id: "RSE", name: "Ralf S. Engelschall" })
    const pBEN = await dm.Person.create ({ id: "BEN", name: "Bernd Endras" })
    const pCGU = await dm.Person.create ({ id: "CGU", name: "Carol Gutzeit" })
    const pMWS = await dm.Person.create ({ id: "MWS", name: "Mark-W. Schmidt" })
    const pBWE = await dm.Person.create ({ id: "BWE", name: "Bernhard Weber" })
    const pFST = await dm.Person.create ({ id: "FST", name: "Florian Stahl" })
    await uMSG.setDirector(pHZ)
    await uMSG.setMembers([ pHZ, pJS ])
    await uXT.setDirector(pRSE)
    await uXT.setMembers([ pRSE, pBEN, pCGU ])
    await uXT.setParentUnit(uMSG)
    await uXIS.setDirector(pMWS)
    await uXIS.setMembers([ pMWS, pBWE, pFST ])
    await uXIS.setParentUnit(uMSG)
    await pJS.setSupervisor(pHZ)
    await pRSE.setSupervisor(pJS)
    await pBEN.setSupervisor(pRSE)
    await pCGU.setSupervisor(pRSE)
    await pMWS.setSupervisor(pJS)
    await pBWE.setSupervisor(pMWS)
    await pFST.setSupervisor(pMWS)
})()

/*  bootstrap GraphQL to Sequelize mapping  */
let id = 0
const gts = new GraphQLSequelize(db, {
    idtype: "String",
    idmake: () => (id++).toString()
})
gts.boot()

/*  the generic data access methods  */
class DAO {
    static QueryEntityOne (entity) {
        return gts.entityQueryResolver("Root", "", entity)
    }
    static QueryEntityAll (entity) {
        return gts.entityQueryResolver("Root", "", `${entity}*`)
    }
    static QueryRelationshipOne (entity, relationship, target) {
        return gts.entityQueryResolver(entity, relationship, target)
    }
    static QueryRelationshipMany (entity, relationship, target) {
        return gts.entityQueryResolver(entity, relationship, `${target}*`)
    }
    static MutationCreate (entity) {
        return gts.entityCreateResolver(entity)
    }
    static MutationClone (entity) {
        return gts.entityCloneResolver(entity)
    }
    static MutationUpdate (entity) {
        return gts.entityUpdateResolver(entity)
    }
    static MutationDelete (entity) {
        return gts.entityDeleteResolver(entity)
    }
}

/*  the GraphQL schema definition  */
let definition = `
    schema {
        query:    Root
        mutation: Root
    }
    scalar JSON
    scalar UUID

    #   The root type for entering the graph of **OrgUnit** and **Person** entities.
    #   Access a single entity by unique id or access all entities.
    type Root {
        #   Access a particular organizational unit by unique id.
        ${gts.entityQuerySchema("Root", "", "OrgUnit")}
        #   Access all organizational units.
        ${gts.entityQuerySchema("Root", "", "OrgUnit*")}
        #   Access a particular person by unique id.
        ${gts.entityQuerySchema("Root", "", "Person")}
        #   Access all persons.
        ${gts.entityQuerySchema("Root", "", "Person*")}
    }

    #   The organizational unit to which **Person**s belong to.
    type OrgUnit {
        #   [ATTRIBUTE] Unique identifier of an organizational unit.
        id: ID!
        #   [ATTRIBUTE] Name of an organizational unit.
        name: String
        #   [RELATIONSHIP] **Person** having the director role of an organizational unit.
        ${gts.entityQuerySchema("OrgUnit", "director", "Person")}
        #   [RELATIONSHIP] All **Person**s which are members of the organizational unit.
        ${gts.entityQuerySchema("OrgUnit", "members", "Person*")}
        #   [RELATIONSHIP] The parent organizational unit.
        ${gts.entityQuerySchema("OrgUnit", "parentUnit", "OrgUnit")}
        #   [METHOD] Create a new organization unit.
        ${gts.entityCreateSchema("OrgUnit")}
        #   [METHOD] Clone an existing organization unit.
        ${gts.entityCloneSchema("OrgUnit")}
        #   [METHOD] Update an existing organization unit.
        ${gts.entityUpdateSchema("OrgUnit")}
        #   [METHOD] Delete an existing organization unit.
        ${gts.entityDeleteSchema("OrgUnit")}
    }

    #   The persons belonging to **OrgUnit**s.
    type Person {
        #   [ATTRIBUTE] Unique identifier of a person.
        id: ID!
        #   [ATTRIBUTE] Name of a person.
        name: String
        #   [RELATIONSHIP] **OrgUnit** this person belongs to.
        ${gts.entityQuerySchema("Person", "belongsTo", "OrgUnit")}
        #   [RELATIONSHIP] **Person** this person is supervised by.
        ${gts.entityQuerySchema("Person", "supervisor", "Person")}
        #   [METHOD] Create a new person.
        ${gts.entityCreateSchema("Person")}
        #   [METHOD] Clone an existing person.
        ${gts.entityCloneSchema ("Person")}
        #   [METHOD] Update an existing person.
        ${gts.entityUpdateSchema("Person")}
        #   [METHOD] Delete an existing person.
        ${gts.entityDeleteSchema("Person")}
    }
`

/*  the GraphQL schema resolvers  */
let resolvers = {
    JSON: GraphQLTypes.JSON({ name: "JSON" }),
    UUID: GraphQLTypes.UUID({ name: "UUID" }),
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
                with: {
                    name: "Jochen Hörtreiter",
                    supervisor: "RSE"
                }
            ) {
                id
            }
        }
        m2: OrgUnit {
            create(
                id: "CoC-WT",
                with: {
                    name: "CoC Web Technologies",
                    parentUnit: "XT",
                    director: "JHO",
                    members: { set: [ "JHO", "RSE" ] }
                }
            ) {
                id name
            }
        }
        m3: Person(id: "JHO") {
            update(
                with: {
                    belongsTo: "CoC-WT",
                }
            ) {
                id
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

