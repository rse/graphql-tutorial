
MOTIVATION
==========

- GraphQLHub:<br/>
  https://www.graphqlhub.com/

```txt
query {
    twitter {
        user(identifier: name, identity: "engelschall") {
            id created_at screen_name name description url
            followers_count tweets_count
            tweets(limit: 2) {
                text
            }
        }
    }
    github {
        repo(ownerUsername: "rse", name: "componentjs") {
            id name
            issues(limit: 2) {
                id state title
            }
            commits(limit: 2) {
                sha message
            }
         }
    }
}
```
