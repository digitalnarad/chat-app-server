import { response200, response400 } from "../lib/response-messages/index.js";
import catchAsyncFunc from "../middleware/catchAsyncFunc.js";
import { chat_services, request_services } from "../service/index.js";
import { msg } from "../utils/constant.js";

const getPendingMessageRequests = catchAsyncFunc(async (req, res) => {
  const userId = req.userId;
  const pendingRequests = await request_services.findRequestsByUser(userId);
  response200(res, msg.fetchSuccessfully, pendingRequests);
});

const deleteRequest = catchAsyncFunc(async (req, res) => {
  const { id } = req.params;
  const deletedRequest = await request_services.findOneRequests({
    _id: id,
    status: "pending",
  });
  if (!deletedRequest) return response400(res, msg.requestDeletionFailed);

  await request_services.deleteRequest({ _id: id });

  response200(res, msg.requestAlreadyRejected, {});
});

const acceptRequest = catchAsyncFunc(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  const acceptedRequest = await request_services.findOneRequests({
    _id: id,
    status: "pending",
  });
  if (!acceptedRequest) return response400(res, msg.requestNotFound);

  const newChat = await chat_services.registerChat({
    participants: [acceptedRequest.sender_id, userId],
  });

  await request_services.updateRequest(
    {
      _id: id,
    },
    { status: "accepted", chat_id: newChat._id }
  );

  response200(res, msg.requestAccepted, {});
});

export { getPendingMessageRequests, deleteRequest, acceptRequest };
