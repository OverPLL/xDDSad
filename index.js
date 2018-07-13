//TODO:
//Push to Github
//add to portfolio
//Expand lofi songs list
//invite people to server
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const config = require('./config.json');
const bot = new Discord.Client();
const songsListFile = require('./songs.json');
let songsList = songsListFile.songs;
let nowPlaying;

process.on('unhandledRejection', (reason) => {
	console.error(reason);
	process.exit(1);
});

bot.on('ready', () => {
	console.log('bot ready');
});

bot.on('message', (msg) => {
	if (msg.author.id != bot.user.id && msg.content.startsWith('.')){
		let args = msg.content.substring(1).split(' ');
		let cmdTxt = args[0];
		let cmd = commands[cmdTxt];
		if (cmd){
			cmd.process(msg);
		}
	}
});

const commands = {
	'ping': {
		process: function(msg) {
			msg.channel.send({
				'embed': {
					'description': '🏓 pong! my ping is ' + bot.ping + 'ms'
				}
			}
			)}
	},
	'np': {
		process: function(msg) {
			msg.channel.send({
				'embed': {
					'description': 'Currently playing ' + nowPlaying.name + ' by ' + nowPlaying.artist + '.'
				}
			});
		}
	},
	'join': {
		process: function(msg) {
			userIsAdmin = msg.member.roles.some(r=>r.name = "Admin");
			if (userIsAdmin){
				vc = msg.member.voiceChannel;
				vc.join()
					.then(connection => {
						console.log('connected');
						playList(songsList, msg);
					})
					.catch('failed to connect');
			}
		}
	},
	'leave': {
		process: function(msg) {
			userIsAdmin = msg.member.roles.some(r=>r.name = "Admin");
			if (userIsAdmin){
				vc = msg.member.voiceChannel;
				vc.leave();
			}
		}
	},
	'skip': {
		process: function(msg) {
			userIsAdmin = msg.member.roles.some(r=>r.name = "Admin");
			if (userIsAdmin){
				dispatcher.end();
			}
		}
	}
}

function randomizeList(list){
	list.sort(function(a, b){return 0.5 - Math.random()});
}

function playList(songsList, msg){
	let list = songsList.slice();
	randomizeList(list);
	playSong(list, msg);
}

function playSong(list, msg){
	let vc = msg.guild.voiceConnection;
	dispatcher = vc.playStream(ytdl(list[0].url, {filter: 'audioonly'}));
	nowPlaying = list[0];
	console.log('playing ' + list[0].name);
	dispatcher.on('end', () => {
		console.log('end');
		if (list.length > 1){
			list.shift();
			playSong(list, msg);
		} else {
			console.log('restarting');
			playList(songsList, msg);
		}
	});
}

bot.login(config.token);
