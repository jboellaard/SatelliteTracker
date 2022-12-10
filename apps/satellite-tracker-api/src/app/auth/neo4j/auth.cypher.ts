export const AuthNeoQueries = {
  addUser: 'MERGE (a:User {username: $username}) RETURN a',
  removeUser: 'MATCH (a:User {username: $username}) DETACH DELETE a',
  updateUsername:
    'MATCH (a:User {username: $username}) SET a.username = $newUsername RETURN a',
};
