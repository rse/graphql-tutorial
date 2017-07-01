
GraphQL Tutorial
================

This is a didactic introduction to GraphQL, starting from a simple Hello
World to a network-based GraphQL server with a built-in GraphQL UI.
It is provided in the form of a tutorial which step-by-step
introduces more usage of GraphQL. Each tutorial step `XX` can be found
in the file `sample-XX` and run with `npm run sample-XX`. The
distinct tutorial steps are:

1. just plain all-in-one GraphQL "Hello World"
2. replaces GraphQL schema API calls with GraphQL schema definition language
3. split GraphQL usage into distinct parts
4. replace "Hello World" with an entity "OrgUnit" and enable schema/resolver warnings
5. add "Person" entity and use a separate data store
6. factor out resolver functionality into generic data access object functions
7. add QueryEntityOne DAO method for querying particular objects
8. allow relationships to be queried and be strict on resolvers now
9. add remaining CRUD operations (create/clone, update, delete) to GraphQL entity types
10. wrap GraphQL application programming interface (API) with a remote network interface (RNI)
11. replace built-in client with interactive GraphQL web user interface (GraphiQL)
12. add descriptions to GraphQL schema for introspection inside GraphiQL
13. move data into SQLite RDBMS and access it with Sequelize ORM
14. wrap mutations into a single RDBMS transaction
15. support also GraphQL over Websocket communication
16. add GraphQL Subscription support
17. simplify and migrate to all-in-one GraphQL-IO framework

GraphQL Resources
=================

The steadily growing GraphQL community has many resources.
A few selected ones were hand-picked for you here.

GraphQL Community
-----------------

- Awesome GraphQL [1]<br/>
  https://github.com/chentsulin/awesome-graphql

- Awesome GraphQL [2]<br/>
  https://github.com/joshblack/awesome-graphql

GraphQL General
---------------

- GraphQL Query & Schema Language: Learning<br/>
  http://graphql.org/learn/

- GraphQL Schema Language: Learning<br/>
  http://graphql.org/learn/schema/

- GraphQL Schema Language: Cheat Sheet<br/>
  https://wehavefaces.net/graphql-shorthand-notation-cheatsheet-17cd715861b6#.x5zncd650

- GraphQL Query Language Specification<br/>
  http://facebook.github.io/graphql/

Tools
-----

- GraphiQL<br/>
  https://github.com/graphql/graphiql<br/>
  https://github.com/rse/hapi-plugin-graphiql

- ChromeiQL<br/>
  https://chrome.google.com/webstore/detail/chromeiql/fkkiamalmpiidkljmicmjfbieiclmeij

- GraphiCLI/Gest<br/>
  https://github.com/mfix22/graphicli

- GraphQL Network for Chrome<br/>
  https://chrome.google.com/webstore/detail/graphql-network/igbmhmnkobkjalekgiehijefpkdemocm

- GraphQLviz [1]<br/>
  https://github.com/sheerun/graphqlviz

- GraphQLviz [2]<br/>
  https://github.com/Macroz/GraphQLviz

- GraphQL Visualizer [3]<br/>
  http://nathanrandal.com/graphql-visualizer/

- GraphQLHub:<br/>
  https://www.graphqlhub.com/

- PostgraphQL<br/>
  https://github.com/calebmer/postgraphql

- DGraph<br/>
  https://dgraph.io/

Cloud Services
--------------

- GraphQL LaunchPad<br/>
  https://launchpad.graphql.com/

- GraphCool<br/>
  https://www.graph.cool/

Server SDK [JavaScript]
-----------------------

- GraphQL.js<br/>
  https://github.com/graphql/graphql-js

- GraphQL-Tools<br/>
  http://dev.apollodata.com/tools/<br/>
  https://github.com/apollostack/graphql-tools

- GraphQL-Tools Addons<br/>
  https://github.com/rse/graphql-tools-types<br/>
  https://github.com/rse/graphql-tools-sequelize<br/>
  https://github.com/rse/graphql-tools-subscribe

- HAPI Plugin for GraphiQL Integration<br/>
  https://github.com/rse/hapi-plugin-graphiql

Client SDK [JavaScript]
-----------------------

- Apollo Client [JavaScript]<br/>
  http://www.apollostack.com/<br/>
  http://dev.apollodata.com/

- Lokka [JavaScript]<br/>
  https://github.com/kadirahq/lokka

Server or Client SDK [Others]
-----------------------------

- Sangria [Scala]<br/>
  http://sangria-graphql.org/

- GraphQL-Java [Java]<br/>
  https://github.com/graphql-java/graphql-java

- GraphQL-PHP [PHP]<br/>
  https://github.com/webonyx/graphql-php

