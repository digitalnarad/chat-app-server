const { requestController } = require("../controller");
const { isAuthenticated } = require("../middleware/auth");

const router = require("express").Router();

router.get(
  "/fetch-all-requests",
  isAuthenticated,
  requestController.getPendingMessageRequests
);

router.delete(
  "/reject-requests/:id",
  isAuthenticated,
  requestController.deleteRequest
);

router.put(
  "/accept-requests/:id",
  isAuthenticated,
  requestController.acceptRequest
);

module.exports = router;
