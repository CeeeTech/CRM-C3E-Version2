let io;

function initializeSocket(socketIo) {
  io = socketIo;

  io.on('connection', (socket) => {
    const userID = socket.handshake.query.userID;

    console.log(`User ${userID} connected`);
    socket.join(socket.handshake.query.userID);

    socket.on('disconnect', () => {
    console.log(`User ${userID} disconnected`);
  });
  });
}

function emitNotification(userId, message) {
  io.to(`${userId}`).emit('notification', { message: message });

  //io.to(`${userId}`).emit('notification', message);
}

module.exports = {
  initializeSocket,
  emitNotification,
};