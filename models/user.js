var mongoose  = require('mongoose');
var bcrypt    = require('bcryptjs');
var randtoken = require('rand-token');
var Schema    = mongoose.Schema;

var usuarioSchema = mongoose.Schema({
	nome: String,
	foto_perfil: String,
	data_nascimento: Date,
	cpf: String,
	pagamento: {
		numero_cartao: Number,
		data_validade: String,
		codigo_seguranca: Number
	},
	local: {
		email: String,
		senha: String
	},
	facebook: {
		id: String,
		name: String,
		picture: String,
		email: String,
		gender: String,
		link: String,
		locale: String,
		timezone: String,
		token: String
	},
	token: {
		value: {
			type: String,
			default: randtoken.generate(32)
		},
		expireAt: {
			type: Date,
			expires: 60,
			default: Date.now
		}
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String,
		photo: String
	},
	data_cadastro: {type: Date, default: Date.now},
	bubbles: [],
	notificacoes: [],
	connected: {
		status: Boolean,
		date: {type: Date, default: Date.now}
	},
	conversas: [
		{
			socket_id: String,
			connected: {
				status: Boolean, 
				date: {type: Date, default: Date.now}
			},
			bubble_id: String,
			canal_atual: String,
			mensagens: [
				{
					mensagem: String,
					data: {type: Date, default: Date.now},
					visulizada: Boolean,
					remetente: Boolean
				}
			]
		}
	]
});

usuarioSchema.methods.generateHash = function(senha){
	return bcrypt.hashSync(senha, bcrypt.genSaltSync(9));
}

usuarioSchema.methods.validPassword = function(senha){
	return bcrypt.compareSync(senha, this.local.senha);
}

module.exports = mongoose.model('Usuario', usuarioSchema);