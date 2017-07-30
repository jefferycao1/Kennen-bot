const fs = require("fs");
const gm = require('gm');
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const json = require('json-object').setup(global);
const download = require('image-downloader');


var config = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
const options = {
  url: 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png',
  dest: 'C:/jeff/Kennen-bot/photos'
}


const discord_token = config.discord_token;
const prefix = config.prefix;
const bot_controller = config.bot_controller;
const champion_gg_token = config.champion_gg_token;
const lol_api = config.lol_api;
const urlinfo = "http://api.champion.gg/v2/champions?limit=200&champData=hashes,firstitems,summoners,skills,finalitemshashfixed,masterieshash&api_key=" + champion_gg_token;
const urlchampid = "https://na1.api.riotgames.com/lol/static-data/v3/champions?locale=en_US&dataById=false&api_key=" + lol_api;
const urlitems = "https://na1.api.riotgames.com/lol/static-data/v3/items?locale=en_US&api_key=" + lol_api;
const urlitempicture = "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/";
const urlsummonerid = "https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/";




client.login(discord_token);

client.on('message', function(message) {
  const member = message.member;
  const mess = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1).join(" ");
  const userchannel = message.channel;

  if (mess.startsWith(prefix + "info")) {
    getinfo();
  } else if (mess.startsWith(prefix + "build")) {
    getchampionID(args, function(err, champid) {
      if (err) {
        message.reply(err);
      } else {
        getbuild(champid, function(err) {
          message.reply("the top builds that guarentee victory from champion.gg");
          message.channel.send("final highestplayrate build", {
            file: 'C:/jeff/Kennen-bot/playratefinal.jpg'
          });
          message.channel.send("final highestwinrate build", {
            file: 'C:/jeff/Kennen-bot/winratefinal.jpg'
          });

          message.channel.send("starting highestplayrate", {
            file: 'C:/jeff/Kennen-bot/playratestart.jpg'
          });
          message.channel.send("starting items highestwinrate", {
            file: 'C:/jeff/Kennen-bot/winratestart.jpg'
          });

        });
      }
    });
  } else if (mess.startsWith(prefix + "bestkennen")) {
    message.reply("I believe it is Hieverybod from the NA server");
  } else if (mess.startsWith(prefix + "testimage")) {
    message.channel.send({
      embed: {
        color: 3447003,
        title: "This is the build from champion.gg",
        url: "http://www.champion.gg",
        fields: [{
          name: "Starting Items",
          value: "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png",
          image: "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/1001.png"
        }]
      }
    });
  } else if (mess.startsWith(prefix + "image")) {
    message.channel.send("starting items", {
      file: 'C:/jeff/Kennen-bot/output.jpg'
    });
  } else if (mess.startsWith(prefix + "test")) {
    test(message);
  } else if (mess.startsWith(prefix + "match")) {
    getsummonerid(args, function(err, summonerobject) {
      if(err) {
        message.reply(err);
      } else {
        console.log(args);
        console.log(summonerobject);
        getlivematch(summonerobject, function(err, livematchobject) {

        });
      }
    });
  }
});



client.on('ready', function() {
  console.log('I am ready');
});



function getbuild(champid, cb) {
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
      saveitemphotos(finalitemshigh, finalitemswin, startingitemshigh, startingitemswin);
      cb(false);
    }
  });
}

function getchampionID(championname, cb) {
  request(urlchampid, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('expired apikey! ** 403 response code **');
      return;
    } else if (response.statusCode == 503) {
      cb('Riot api ** Static-Data-V3 ** servers are down! Check the riot api discord server. ** 503 response code **');
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

function getsummonerid(summoner, cb) {
  request(urlsummonerid + summoner + "?api_key=" + lol_api, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('expired apikey! ** 403 response code **');
      return;
    } else if (response.statusCode == 503) {
      cb('Riot api ** Summoner-V3 ** servers are down! Check the riot api discord server. ** 503 response code **');
    } else if(response.statusCode == 404) {
      cb('summoner not found!');
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      var summonerid = importedJSON.id;
      var accountlvl = importedJSON.summonerLevel;
      var profileID = importedJSON.profileIconId;
      var summonername = importedJSON.name;
      var summonerobject = {
        "summonerid": summonerid,
        "accountlvl": accountlvl,
        "profileid": profileID,
        "name": summonername
      }
      cb(false, summonerobject);
    }
  });
}

function getlivematch(summonerobject, cb) {

}

function saveitemphotos(fitems_h, fitems_w, sitems_h, sitems_w) {
  var fitems_h_itemarray = fitems_h.hash.split("-");
  var fitems_w_itemarray = fitems_w.hash.split("-");
  var sitems_h_itemarray = sitems_h.hash.split("-");
  var sitems_w_itemarray = sitems_w.hash.split("-");
  for (var items in fitems_h_itemarray) {
    if (fitems_h_itemarray[items] == 'items') {
      continue;
    } else {
      saveImages(fitems_h_itemarray[items]);
    }
  }
  for (var items in fitems_w_itemarray) {
    if (fitems_w_itemarray[items] == 'items') {
      continue;
    } else {
      saveImages(fitems_w_itemarray[items]);
    }
  }
  for (var items in sitems_h_itemarray) {
    if (sitems_h_itemarray[items] == 'first') {
      continue;
    } else {
      saveImages(sitems_h_itemarray[items]);
    }
  }
  for (var items in sitems_w_itemarray) {
    if (sitems_w_itemarray[items] == 'first') {
      continue;
    } else {
      saveImages(sitems_w_itemarray[items]);
    }
  }
  sortimages(fitems_h_itemarray, fitems_w_itemarray, sitems_h_itemarray, sitems_w_itemarray);

}

function sortimages(array1, array2, array3, array4) {
  combineimages(array1, 'playratefinal.jpg');
  combineimages(array2, 'winratefinal.jpg');
  combineimages(array3, 'playratestart.jpg');
  combineimages(array4, 'winratestart.jpg');
  console.log(array1, array2, array3, array4);
  console.log(array1.length, array2.length, array3.length, array4.length);

}

function saveImages(items) {
  options.url = 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + items + '.png';

  download.image(options)
    .then(({
      filename,
      image
    }) => {
      console.log('File saved to', filename)
    }).catch((err) => {
      throw err
    })
}

function combineimages(array, filename) {
  var num = 0
  switch (array.length) {
    case 0:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 1:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 2:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 3:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 4:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 5:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 6:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .in('-page', '+256+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[5] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
      break;
    case 7:
      gm()
        .in('-page', '+0+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[1] + '.png')
        .in('-page', '+64+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[2] + '.png')
        .in('-page', '+128+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[3] + '.png')
        .in('-page', '+192+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[4] + '.png')
        .in('-page', '+256+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[5] + '.png')
        .in('-page', '+320+0')
        .in('C:/jeff/Kennen-bot/photos/' + array[6] + '.png')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
        });
  }
}

function test(message) {
  message.channel.send("test");
}
