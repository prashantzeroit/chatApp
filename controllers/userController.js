const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const bcrypt = require('bcrypt');

const getRegisterPage = async(req,res)=>{
    try {
        res.render("register");
    } catch (error) {
        console.log(error.message);
    }
}

const postRegisterUser = async(req,res)=>{
    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: passwordHash,
            image: 'userImages/'+req.file.filename
        });
        const userData = await user.save();
        res.render("register", { msg: "Registration successfully!!!" });

    } catch (error) {
        console.log(error.message);
    }
}

const getLoginPage = async(req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const postLoginUser = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await User.findOne({email:email});

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if(passwordMatch){
                const userResult = {
                    name:userData.name,
                    email:userData.email,
                    password:userData.password,
                    image:userData.image,
                }
                    const response = {
                    success: true,
                    msg: "User Details",
                    data: userResult
                }
                req.session.user = userData; // session store....
                res.status(200).send(response);
            }else{
                res.status(200).send({success: false , msg:"Login details are Incorrect."});
            }
        }else {
            res.status(200).send({success: false , msg:"Login details are Incorrect."});
        }
    }catch (error) {
        res.status(400).send(error.message);
    }
}

const getdashboard = async(req,res)=>{
    try {

        var users = await User.find({ _id: {$nin:[req.session.user._id]} });
        res.render('dashboard', { user: req.session.user, users:users });
        
    } catch (error) {
        console.log(error.message);
    }
}

const LogoutUser = async(req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async(req,res)=>{
    try {

        var chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message
        });

        const newChat = await chat.save();
        res.status(200).send({ success:true, msg:'Chat Inserted...', data:newChat });

    } catch (error) {
       res.status(400).send({ success:false, msg:error.message });
    }
}

const deleteChat = async(req,res)=>{
    try {

        await Chat.deleteOne({ _id: req.body.id })
        res.status(200).send({ success:true });

    } catch (error) {
        res.status(400).send({ success:false, msg:error.message });
    }
}

const updateChat = async(req,res)=>{
    try {
        await Chat.findByIdAndUpdate({ _id: req.body.id },{
            $set: {
                message: req.body.message
            }
        });
        res.status(200).send({ success:true });
        
    } catch (error) {
        res.status(400).send({ success:false, msg:error.message });
    }
}

module.exports = {
    getRegisterPage,
    postRegisterUser,
    getLoginPage,
    postLoginUser,
    getdashboard,
    LogoutUser,
    saveChat,
    deleteChat,
    updateChat
}