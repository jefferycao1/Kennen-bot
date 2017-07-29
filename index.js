const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const json = require('json-object').setup(global);


var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));



const discord_token = config.discord_token;
const prefix = config.prefix;
const bot_controller = config.bot_controller;
const champion_gg_token = config.champion_gg_token;
const lol_api = config.lol_api;
const urlinfo = "http://api.champion.gg/v2/champions?limit=200&champData=hashes,firstitems,summoners,skills,finalitemshashfixed,masterieshash&api_key=" + champion_gg_token;
const urlchampid = "https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&dataById=false&api_key=" + lol_api;
const urlitems = "https://na1.api.riotgames.com/lol/static-data/v3/items?locale=en_US&api_key=" + lol_api;





client.login(discord_token);

client.on('message', function(message) {
  const member = message.member
  const mess = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1).join(" ");

  if (mess.startsWith(prefix + "info")) {
    getinfo();
  } else if (mess.startsWith(prefix + "build")) {
    getchampionID(args, function(err, champid) {
      if (err) {
        message.reply(err);
      } else {
        getbuild(champid, function(err, buildmessage) {

        });
      }
    });
  } else if (mess.startsWith(prefix + "bestkennen")) {
    message.reply("I believe it is Hieverybod from the NA server");
  }
});



client.on('ready', function() {
  console.log('I am ready');
});



function getbuild(champid) {
  console.log(champid);
  request(urlinfo, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('invalid champion.gg apikey!');
      return;
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      var championobject = {};
      for (var key in importedJSON) {
        if (importedJSON[key].championId == champid) {
          championobject = importedJSON[key];
          break;
        }
      }
      var finalitemshigh = championobject.hashes.finalitemshashfixed.highestCount;
      var finalitemswin = championobject.hashes.finalitemshashfixed.highestWinrate;
      var startingitemshigh = championobject.hashes.firstitemshash.highestCount;
      var startingitemswin = championobject.hashes.firstitemshash.highestWinrate;


    }
  });
}

function getchampionID(championname, cb) {
  request(urlchampid, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('expired apikey!');
      return;
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      championname = championname.toLowerCase();
      championname = championname.charAt(0).toUpperCase() + championname.slice(1);
      try {
        var data = importedJSON.data[championname].id;
      } catch (err) {
        cb('Type a real champion name!');
        return;
      }
      cb(false, data);
    }
  });
}
