const express = require("express");

const router = express.Router();

const UserController = require("../controllers/UserController")

router.get("/api/user/getListUser",UserController.verifyToken,UserController.apiGetListUser)
router.post('/api/user/loginUser',UserController.apiLoginUser)
router.post('/api/user/createUser',UserController.apiCreateUser)
router.put("/api/user/putUser",UserController.apiPutUser);


module.exports= router;