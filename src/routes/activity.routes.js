const express = require("express");
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');

const activity = require("../controllers/activity.controller");

router.post("/create-post",authMiddleware, activity.createPost);
router.post("/get-post-list",authMiddleware, activity.getPostList);
router.post("/get-post-marker-list",authMiddleware, activity.getPostMarkerList);
router.post("/get-post",authMiddleware, activity.getPost);
router.post("/get-comments",authMiddleware, activity.getComments);
router.post("/save-like-dislike",authMiddleware, activity.saveLikeDislike);
router.post("/save-viewed",authMiddleware, activity.saveViewed);
router.post("/save-comment",authMiddleware, activity.saveComment);
router.post("/save-comment",authMiddleware, activity.saveComment);
router.post("/get-flag-types",authMiddleware, activity.getFlagTypes);
router.post("/save-flag",authMiddleware, activity.saveFlag);
router.post("/get-event-list",authMiddleware, activity.getEventList);
router.post("/get-event-list",authMiddleware, activity.getEventList);
router.post("/get-event",authMiddleware, activity.getEvent);
router.post("/get-event-marker-list",authMiddleware, activity.getEventMarkerList);
module.exports = router;
