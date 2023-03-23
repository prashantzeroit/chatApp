const express = require('express');

const user_route = express();

const bodyParser = require('body-parser');

const session = require('express-session');
const { SESSION_SECRET } = process.env;
user_route.use(session({ 
    secret:SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded( { extended: true } ));

user_route.set('view engine', 'ejs');
user_route.set('views', [
    './views'
]);

user_route.use(express.static('public'));

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,path.join(__dirname,'../public/userImages'),(error, success)=>{
            if(error) throw error
        });
    },
    filename:(req,file,cb)=>{
        const name = Date.now()+ '-' +file.originalname
        cb(null,name, (error, success)=>{
            if(error) throw error
        });
    }
});

const upload = multer({storage:storage});

const auth = require('../middleware/auth')
const userController = require('../controllers/userController');

user_route.get('/register',auth.isLogout,userController.getRegisterPage);
user_route.post('/register',upload.single('image'),userController.postRegisterUser);

user_route.get('/',auth.isLogout,userController.getLoginPage);
user_route.post('/',userController.postLoginUser);

user_route.get('/logout',auth.isLogin,userController.LogoutUser);

user_route.get('/dashboard',auth.isLogin,userController.getdashboard);

user_route.post('/save-chat',userController.saveChat)
user_route.post('/delete-chat',userController.deleteChat)
user_route.post('/update-chat',userController.updateChat)


user_route.get('*',function(req,res){
    res.redirect('/');
});

module.exports = user_route;