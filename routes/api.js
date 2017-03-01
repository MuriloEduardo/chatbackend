let express = require('express');
let router = express.Router();
let jwt = require('jwt-simple');
let config = require('../config/database');

let Chat = require('../models/chat');
let User = require('../models/user');

////////////// CHAT ///////////////////////////////
//////////////////////////////////////////////////

/* GET All Chats */
router.get('/chats', (req, res, next) => {
	Chat.find({}, function(err, chats){
		if(err) res.send(err);
		res.json(chats);
	});
});

/* GET Single Chat */
router.get('/chat/:id', (req, res, next) => {
	Chat.findOne({_id: req.params.id}, function(err, chat){
		if(err) res.send(err);
		res.json(chat);
	});
});

/* POST Chat */
router.post('/chat', (req, res, next) => {
	let dadosChat = req.body.dados;
	if(!dadosChat) {
		res.status(400);
		res.json({"error": "dados incompletos"});
	} else {
		let novoChat = new Chat();
		novoChat.dados = dadosChat;

		novoChat.save((err, data) => {
			if(err) res.send(err);
			res.json(data);
		});
	}
});

/* DELETE Chat */
router.delete('/chat/:id', (req, res, next) => {
	Chat.remove({_id: req.params.id}, function(err, chat){
		if(err) res.send(err);
		res.json(chat);
	});
});

/* UPDATE Chat */
router.put('/chat/:id', (req, res, next) => {
	let dadosChat = req.body.dados;
	Chat.findOne({_id: req.params.id}, function(err, chat){
		if(err) res.send(err);

		if(!dadosChat) {
			res.status(400);
			res.json({"error": "dados incompletos"});
		} else {
			chat.dados = dadosChat;

			chat.save((err, data) => {
				if(err) res.send(err);
				res.json(data);
			});
		}
	});
});


//////////////// USUARIO /////////////////////////////
/////////////////////////////////////////////////////

router.post('/authenticate', (req, res, next) => {

	console.log(req.body)

	User.findOne({
        'local.email': req.body.email
    }, function(err, user){
        if (err) throw err;
        
        if(!user) {
            res.json({success: false, msg: 'Authentication failed, User not found'});
            console.log({success: false, msg: 'Authentication failed, User not found'})
        } else {

   			let token = jwt.encode(user, config.secret);
   			console.log(token)
			if(!user.validPassword(req.body.senha)) {
				return res.json({success: false, msg: 'Authenticaton failed, wrong password.'});
				console.log({success: false, msg: 'Authenticaton failed, wrong password.'})
			}
   			res.json({success: true, token: token});
        }  
    });
});

router.post('/adduser', (req, res, next) => {
	if((!req.body.email) || (!req.body.senha)){
        res.json({success: false, msg: 'Enter all values'});
    }
    else {

		let newUser = new User();
		newUser.local.email = req.body.email;
		newUser.local.senha = newUser.generateHash(req.body.senha);
        
        newUser.save(function(err, newUser){
            if (err){
                res.json({success:false, msg:'Failed to save'})
            }
            
            else {
                res.json({success:true, msg:'Successfully saved'});
            }
        })
    }
});

/*router.get('/getinfo', (req, res, next) => {
	if(req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        let token = req.headers.authorization.split(' ')[1];
        let decodedtoken = jwt.decode(token, config.secret);
        return res.json({success: true, msg: 'hello '+decodedtoken.name});
    }
    else {
        return res.json({success:false, msg: 'No header'});
    }
});*/

module.exports = router;