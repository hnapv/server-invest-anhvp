const UserService = require("../services/UserService")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')

let refreshTokens = []

const verifyToken = (req, res, next) => {
    const token = req.headers.token;
    if (token) {
        const accessToken = token.split(" ")[1];
        console.log(accessToken)
        jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
            if (err) {
                res.status(403).json("Token is not valid")
            }
            req.user = user
            next()
        })
    }
    else {
        res.status(401).json("You're not authenticated")
    }
}

const verifyTokenAndAdminAuth = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user._id == req.body._id || req.user.admin) {
            next();
        }
        else {
            res.status(403).json("You're not allowed to delete other")
        }
    })
}

const apiGetListUser = async (req, res) => {
    const getlistuser = await UserService.GetListUser()
    res.send(getlistuser);
}

const apiCreateUser = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt)

        const User = {
            fullname: req.body.fullname,
            username: req.body.username,
            password: hashed,
            email: req.body.email
        }
        console.log(User);
        const insertNewUser = await UserService.CreateUser(User)
        res.send(insertNewUser)

    }
    catch (err) { res.status(500).json(err) }
}

//generate access token
const generateAccessToken = (user) => {
    return jwt.sign({
        _id: user._id,
        admin: user.admin
    },
        process.env.JWT_ACCESS_KEY,
        { expiresIn: "30s" });
}

//generate refresh token
const generateRefreshToken = (user) => {
    return jwt.sign({
        _id: user._id,
        admin: user.admin
    },
        process.env.JWT_REFRESH_KEY,
        { expiresIn: "365d" })
}

const apiRefreshToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.status(401).json("You're not authenticated")
    if(!refreshTokens.includes(refreshToken)){
        return res.status(403).json("Refresh token is not valid")
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
        if (err) {
            console.log(err)
        }
        refreshTokens = refreshTokens.filter((token)=>token !== refreshToken)
        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)
        refreshTokens.push(newRefreshToken)
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/",
            sameSite: "strict"
        })
        res.status(200).json({ accessToken: newAccessToken })
    })
}

const apiLoginUser = async (req, res) => {
    try {
        const username = req.body.username
        const user = await UserService.GetUserByUserName(username);
        if (!user) {
            res.status(404).send("Tai khoan khong ton tai");
        }
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) {
            res.status(400).send("Mat khau khong chinh xac!")
        }
        if (user && validPassword) {
            const accessToken = generateAccessToken(user)
            const refreshToken = generateRefreshToken(user)
            refreshTokens.push(refreshToken)
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                path: "/",
                sameSite: "strict"
            })
            const { password, ...others } = user._doc
            res.status(200).send({ ...others, accessToken })
        }
    }
    catch (err) { res.status(500).json(err) }
}

const apiLogoutUser = async(req,res)=>{
    res.clearCookie("refreshToken")
    refreshTokens=refreshTokens.filter(token => token != req.cookies.refreshToken)
    res.status(200).json("Logged out!")
}

const apiPutUser = async (req, res) => {
    console.log('apiPutUser');
    res.send(200)
}

const apiDeleteUser = async (req, res) => {
    const _id = req.body._id
    console.log(_id)
    const delUser = await UserService.DeleteUser(_id)
    res.send(delUser)
}


module.exports = {
    verifyToken,
    verifyTokenAndAdminAuth,
    apiRefreshToken,
    apiGetListUser,
    apiCreateUser,
    apiLoginUser,
    apiLogoutUser,
    apiPutUser,
    apiDeleteUser
}