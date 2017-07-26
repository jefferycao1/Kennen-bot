const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");


var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));



const discord_token = config.discord_token;
const prefix = config.prefix;
const bot_controller = config.bot_controller;
const champion_gg_token = config.champion_gg_token;
const urlinfo = "http://api.champion.gg/v2/champions?limit=200&champData=hashes,firstitems,summoners,skills,finalitemshashfixed,masterieshash&api_key=" + champion_gg_token;





client.login(discord_token);

client.on('message', function(message) {
      const member = message.member
      const mess = message.content.toLowerCase();
      const args = message.content.split(' ').slice(1).join(" ");

      if (mess.startsWith(prefix, +"info")) {
        getinfo()
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
