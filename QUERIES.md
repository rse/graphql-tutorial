
Queries
=======

This is a didactic introduction to GraphQL, starting from
a simple Hello World to a network-based GraphQL server
with a built-in GraphQL UI.

For inspiration, here are a few sample GraphQL queries:

```txt
query MobileClient {
    OrgUnits {
        id
        name
    }
}
```

```txt
query DesktopClient {
    OrgUnits {
        id
        name
        parentUnit { id }
        members    { id name }
    }
}
```

```txt
query Nested {
    OrgUnits {
        director {
            id
            name
        }
        members {
            id
            name
            supervisor {
                id
                name
            }
        }
    }
}
```

```txt
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
```

```txt
mutation SequencedMutation {
    Person(id: "RSE") {
        q1: name
        m1: update(name: "Rafaelo S. Angelo-Suono") { name }
        q2: name
    }
}
```

