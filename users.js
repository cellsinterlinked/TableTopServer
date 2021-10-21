const users = [];

const addUser = ({ id, name, room, role}) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();
  role = role.trim().toLowerCase();

  const existingUser = users.find((user) => user.room === room && user.name === name);
  const existingRole = users.find((user) => user.room === room && user.role === role);
  console.log(role)
  console.log(users.find((user) => user.room === room && user.role === role)); //why is this undefined?


  if (role === 'dm' && existingRole) {
    return {error: 'There is already a DM'}
  } 

  if(existingUser) {
    return { error: 'Username is taken' };
  }

  const user = { id, name, room, role };

  users.push(user);
  return { user };
}



const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }
}

const getUser = (id) => users.find((user) => user.id === id);



const getUsersInRoom = (room) =>  users.filter((user) => user.room === room)

module.exports = { addUser, removeUser, getUser, getUsersInRoom };