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

  if (mess.startsWith(prefix +"info")) {
    getinfo()
  } else if(mess.startsWith(prefix + "champname")) {
    getchampionID(args)
  }
});



client.on('ready', function() {
  console.log('I am ready');
});



function getinfo() {
  request(urlinfo, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      console.log(importedJSON);
    }
  })
}

function getchampionID(championname) {
  console.log(championname);
  request(urlchampid, function(error, response, body) {
    if(error){
      console.log("error while loading urlchampid link");
    }
    else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      championname = championname.toLowerCase();
      championname = championname.charAt(0).toUpperCase() + championname.slice(1);
      var data = importedJSON.data[championname].id;
      return data;
    }
    })
  }
