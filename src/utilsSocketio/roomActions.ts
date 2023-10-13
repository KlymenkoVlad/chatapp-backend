const users = [];

export const removeUser = async (socketId) => {
  const indexOf = users.map((user) => user.socketId).indexOf(socketId);

  await users.splice(indexOf, 1);
};

export const addUser = async (userId: string, socketId) => {
  console.log(users);
  const user = users.find((user) => user.userId === userId);

  if (user && user.socketId === socketId) {
    return users;
  }
  if (user && user.socketId !== socketId) {
    await removeUser(user.socketId);
  }

  const newUser = { userId, socketId };

  users.push(newUser);

  return users;
};

export const findConnectedUser = (userId: string) =>
  users.find((user) => user.userId === userId);
