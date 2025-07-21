module.exports =
  (theFunc, socket, io) =>
  (payload, callback = () => {}) => {
    Promise.resolve(theFunc(socket, res, next)).catch(next);
  };
