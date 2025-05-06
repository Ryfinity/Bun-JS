const express = require("express");
const {
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

// router instance
const router = express.Router();

// routes list
router.get("/users", getUsers);
router.get("/user/:id", getUserById);
router.post("/user", addUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

module.exports = router;