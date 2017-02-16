const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const configDB = require('../config/database');

let Chat = require('../models/chat');

mongoose.connect(configDB.url, (err, res) => {
	mongoose.Promise = global.Promise;
	if(err) throw err;
	console.info('MongoDB Conectado');
});

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

module.exports = router;