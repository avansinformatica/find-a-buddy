export const NeoQueries = {
    inviteFriend: 'MERGE (a:User {id: $idA}) \
                   MERGE (b: User {id: $idB}) \
                   MERGE (a)-[:Invited]->(b)',
    acceptFriend: 'MATCH (a:User {id: $idA})-[r:Invited]-(b:User {id: $idB}) \
                   DELETE r \
                   MERGE (a)-[:AreFriends {since: $now}]-(b)',
    removeFriend: '',
}
