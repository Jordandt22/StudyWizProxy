module.exports = {
  socketErrorHandler: (status, event, msg, extra) => {
    const error = {
      status,
      message: `${event} - ${msg}`,
    };
    const err = new Error(error.message);
    err.data = { ...error, extra: extra ? extra : null };
    return { error: err };
  },
  emitSocketError: (socket, event, status, message) =>
    socket.emit(event, { error: { status, message } }),
};
