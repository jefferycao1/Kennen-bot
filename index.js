const fs = require("fs");
const gm = require('gm');
const Discord = require("discord.js");
const client = new Discord.Client();
const request = require("request");
const json = require('json-object').setup(global);
const download = require('image-downloader');
const roundTo = require('round-to');
const async = require('async');

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
const urllivematch = "https://na1.api.riotgames.com/lol/spectator/v3/active-games/by-summoner/";
const urlgetchamp = "http://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json";
const urlgetmastery = "https://na1.api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/";
const urlgetrank = "https://na1.api.riotgames.com/lol/league/v3/positions/by-summoner/";

var queuearray = {
  '0': 'Custom',
  '8': 'Normal 3v3',
  '2': 'Normal 5v5 Blind Pick',
  '14': 'Normal 5v5 Draft Pick',
  '4': 'Ranked Solo 5v5',
  '6': 'Ranked Premade 5v5',
  '41': 'Ranked 3v3',
  '42': 'Ranked Team 5v5',
  '16': 'Dominion 5v5 Blind Pick',
  '17': 'Dominion 5v5 Draft Pick',
  '25': 'Dominion Coop vs Al',
  '31': 'Coop vs Al Into Bot',
  '32': 'Coop vs Al Beginner Bot',
  '61': 'Teambuilder',
  '65': 'ARAM',
  '70': 'One for All',
  '76': 'URF',
  '325': 'All Random Games',
  '400': 'Normal 5v5 Draft Pick',
  '410': 'Ranked 5v5 Draft Pick',
  '420': 'Ranked Solo',
  '430': 'Normal Blind Pick',
  '440': 'Ranked Flex',
  '600': 'Blood Hunt Assassin',
  '610': 'Dark Star'
};
var mapname = {
  '1': `Summoner's Rift`,
  '2': `Summoner's Rift Autumn`,
  '3': 'Proving Grounds',
  '4': 'Twisted Treeline',
  '8': 'The Crystal Scar',
  '10': 'Twisted Treeline',
  '11': `Summoner's Rift`,
  '12': 'Howling Abyss',
  '14': `Butcher's Bridge`,
  '16': 'Cosmic Ruins'
};

client.login(discord_token);

client.on('message', function(message) {
  const member = message.member;
  const mess = message.content.toLowerCase();
  const args = message.content.split(' ').slice(1).join(" ");
  const argstwo = message.content.split(' ').slice(1);
  const userchannel = message.channel;

  if (mess.startsWith(prefix + "info")) {
    getinfo();
  } else if (mess.startsWith(prefix + "build")) {
    getchampionID(argstwo[0], function(err, champid) {
      if (err) {
        message.reply(err);
      } else {
        getbuild(champid, argstwo, function(err, championggobject) {
          if (err) {
            message.reply(err);
          } else {
            printbuild(message, args, championggobject);
          }
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
  } else if (mess.startsWith(prefix + "match")) {
    getsummonerid(args, function(err, summonerobject) {
      if (err) {
        message.reply(err);
      } else {
        console.log(args);
        getlivematch(summonerobject, function(err, livematchobject) {
          if (err) {
            message.reply(err);
          } else {
            //console.log(livematchobject);
            matchinfo(livematchobject, summonerobject, function(err, matchobject, summonerobject) {
              if (err) {
                message.reply(err);
              } else {
                console.log(matchobject);
                console.log(summonerobject);
                matchmessage(message, matchobject, summonerobject);
              }
            });
          }
        });
      }
    });
  } else if (mess.startsWith(prefix + 'help')) {
    const embed = new Discord.RichEmbed()
      .setTitle('Commands for Kennen-bot')
      .setColor(12717994)
      .addField("** -build **", "Type -build championname role \n**Examples:** -build kennen -build ezreal adc.\nThis command will return builds from champion.gg")
      .addField("** -match **", "Type -match summonername \n**Examples:** -match hieverybod\nThis will return the current match they are in and info about it\nOnly works for games in NA")

    message.channel.send({
      embed
    });

  }
});



client.on('ready', function() {
  console.log('I am ready');
});



function getbuild(champid, argstwo, cb) {
  //console.log(champid);
  console.log('success');
  var champrole = argstwo.slice(1).join('_').toUpperCase();
  if (champrole == 'ADC' || champrole == 'DUOCARRY') {
    champrole = 'DUO_CARRY';
  } else if (champrole == 'DUOSUPPORT' || champrole == 'SUPPORT') {
    champrole = 'DUO_SUPPORT';
  } else if (champrole == 'MID') {
    champrole = 'MIDDLE';
  }
  console.log(champrole);
  request(urlinfo, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('invalid champion.gg apikey!');
      return;
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      var championobject = {};
      var notfound = true;
      if (champrole == "") {
        for (var key in importedJSON) {
          if (importedJSON[key].championId == champid) {
            championobject = importedJSON[key];
            notfound = false;
            break;
          }
        }
      } else {
        for (var key in importedJSON) {
          if (importedJSON[key].championId == champid && importedJSON[key].role == champrole) {
            championobject = importedJSON[key];
            notfound = false;
            break;
          }
        }
      }
      if (notfound) {
        cb('can not find build for that role!');
      } else {
        var finalitemshigh = championobject.hashes.finalitemshashfixed.highestCount;
        var finalitemswin = championobject.hashes.finalitemshashfixed.highestWinrate;
        var startingitemshigh = championobject.hashes.firstitemshash.highestCount;
        var startingitemswin = championobject.hashes.firstitemshash.highestWinrate;
        var championggobject = {
          finalitemshighgames: finalitemshigh.count,
          finalitemshighwinrate: finalitemshigh.winrate,
          finalitemswingames: finalitemswin.count,
          finalitemswinwinrate: finalitemswin.winrate,
          startingitemshighgames: startingitemshigh.count,
          startingitemshighwinrate: startingitemshigh.winrate,
          startingitemswingames: startingitemswin.count,
          startingitemswinwinrate: startingitemswin.winrate,
          role: championobject.role
        }
        console.log('success');
        saveitemphotos(finalitemshigh, finalitemswin, startingitemshigh, startingitemswin, function() {
          cb(false, championggobject);
        });
      }

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
    } else if (response.statusCode == 429) {
      cb('rate limit exceeded');
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      championname = championname.toLowerCase();
      championname = championname.charAt(0).toUpperCase() + championname.slice(1);
      if (championname == "Wukong") {
        data = 62;
      } else if (championname == "Missfortune" || championname == "Miss fortune" || championname == "Ms. fortune") {
        data = 21;
      } else if (championname == "Drmundo" || championname == "Dr mundo") {
        data = 36;
      } else if (championname == "Twistedfate" || championname == "Twisted fate") {
        data = 4;
      } else if (championname == "Masteryi" || championname == "Master yi") {
        data = 11;
      } else if (championname == "Tahmkench" || championname == "Tahm kench") {
        data = 223;
      } else if (championname == "Xinzhao" || championname == "Xin zhao") {
        data = 5;
      } else if (championname == "Aurelionsol" || championname == "Aurelion sol") {
        data = 136;
      } else if (championname == "Leesin" || championname == "Lee sin") {
        data = 64;
      } else if (championname == "Reksai" || championname == "Rek'sai") {
        data = 421;
      } else if (championname == "Jarvaniv" || championname == "Jarvan iv") {
        data = 59;
      } else if (championname == "Kogmaw" || championname == "Kog'maw") {
        data = 96;
      } else {
        try {
          var data = importedJSON.data[championname].id;
        } catch (err) {
          cb('Type a real champion name!');
          return;
        }
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
    } else if (response.statusCode == 404) {
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
  request(urllivematch + summonerobject.summonerid + "?api_key=" + lol_api, function(error, response, body) {
    if (error || response.statusCode == 403) {
      cb('expired apikey! ** 403 response code **');
      return;
    } else if (response.statusCode == 503) {
      cb('Riot api ** Summoner-V3 ** servers are down! Check the riot api discord server. ** 503 response code **');
    } else if (response.statusCode == 404) {
      cb('summoner not in a match');
    } else if (!error && response.statusCode == 200) {
      console.log("found match, making matchobject");
      var importedJSON = JSON.parse(body);
      var gameid = importedJSON.gameId;
      var gamemode = importedJSON.gameMode;
      var mapid = importedJSON.mapId;
      var gameType = importedJSON.gameType;
      var gametime = importedJSON.gameStartTime;
      var participants = importedJSON.participants;
      var matchobject = {
        "gameid": gameid,
        "gamemode": gamemode,
        "mapid": mapid,
        "gametype": gameType,
        "gametime": gametime,
        "participants": participants,
        "queue": importedJSON.gameQueueConfigId
      }
      cb(false, matchobject);
    }
  });
}

function matchinfo(livematchobject, summonerobject, cb) {
  var placeholder = livematchobject.queue;
  var gametype = queuearray[placeholder];
  placeholder = livematchobject.mapid;
  var map = mapname[placeholder];
  var matchid = livematchobject.gameid;
  var time = livematchobject.gametime;
  var milliseconds = (new Date).getTime();
  time = (time - milliseconds) * -1;
  var second = (time / 1000) % 60 - 0.5;
  var minute = (time / (1000 * 60)) % 60 - 0.5;
  var hour = (time / (1000 * 60 * 60)) - 0.5;
  second = roundTo(second, 0);
  minute = roundTo(minute, 0);
  hour = roundTo(hour, 0);
  time = hour + " hours, " + minute + " minutes and " + second + " seconds";
  var players = livematchobject.participants;
  var blueplayers = [];
  var redplayers = [];
  var team;
  for (var i = 0; i < players.length; i++) {
    playerobject = {};
    if (players[i].teamId == 100) {
      playerobject.summonername = players[i].summonerName;
      playerobject.championid = players[i].championId;
      playerobject.summonerid = players[i].summonerId;
      playerobject.team = "BLUE";
      playerobject.mostplayed = false;
      playerobject.masterypoints = 0;
      blueplayers.push(playerobject);
      if (summonerobject.summonerid == players[i].summonerId) {
        team = 'BLUE';
      }
    } else {
      playerobject.summonername = players[i].summonerName;
      playerobject.championid = players[i].championId;
      playerobject.summonerid = players[i].summonerId;
      playerobject.team = "RED";
      playerobject.mostplayed = false;
      playerobject.masterypoints = 0;
      redplayers.push(playerobject);
      if (summonerobject.summonerid == players[i].summonerId) {
        team = 'RED';
      }
    }
  }
  matchobject = {
    'gametype': gametype,
    'map': map,
    'time': time,
    'blueplayers': blueplayers,
    'redplayers': redplayers,
    'team': team
  }
  livematchaddchampion(matchobject, function(err, newmatchobject) {
    if (err) {
      cb(err);
    } else {
      cb(false, newmatchobject, summonerobject);
    }

  });
}

function livematchaddchampion(matchobject, cb) {
  request(urlgetchamp, function(error, response, body) {
    if (response.statusCode == 503) {
      cb('Riot ddragon servers down! Check the riot api discord server. ** 503 response code **');
    } else if (!error && response.statusCode == 200) {
      var importedJSON = JSON.parse(body);
      var anothajson = importedJSON.data;
      for (var i = 0; i < matchobject.blueplayers.length; i++) {
        for (var key in anothajson) {
          if (anothajson[key].key == (matchobject.blueplayers[i].championid + "")) {
            matchobject.blueplayers[i].championname = anothajson[key].id;
          } else if (matchobject.blueplayers[i].championid == 141) {
            matchobject.blueplayers[i].championname = "Kayne";
          } else {
            continue;
          }
        }
      }
      for (var i = 0; i < matchobject.redplayers.length; i++) {
        for (var key in anothajson) {
          if (anothajson[key].key == (matchobject.redplayers[i].championid + "")) {
            matchobject.redplayers[i].championname = anothajson[key].id;
          } else if (matchobject.redplayers[i].championid == 141) {
            matchobject.redplayers[i].championname = "Kayne";
          } else {
            continue;
          }
        }
      }
    }

    livematchaddmastery(matchobject, function(err, newmatchobject) {
      if (err) {
        cb(err);
      } else {
        cb(false, newmatchobject);
      }
    })
  });


}

function livematchaddmastery(matchobject, cb) {
  //console.log(matchobject);
  var teamarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
  } else {
    teamarray = "redplayers";
  }
  var loops = 0;
  async.forEachOf(matchobject[teamarray], function(value, l, callback) {
    request(urlgetmastery + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, function(error, response, body) {
      if (response.statusCode == 503) {
        cb('Riot ddragon servers down! Check the riot api discord server. ** 503 response code **');
      } else if (response.statusCode == 404) {
        cb('404 in urlgetmastery link');
      } else if (!error && response.statusCode == 200) {
        var importedJSON = JSON.parse(body);

        if (importedJSON[0].championId == matchobject[teamarray][l].championid) {
          matchobject[teamarray][l].mostplayed = true;
        }
        for (var j = 0; j < 10; j++) {
          if (importedJSON[j].championId == matchobject[teamarray][l].championid) {
            matchobject[teamarray][l].masterypoints = importedJSON[j].championPoints;
            break;
          }
        }
        loops++;
        if (loops == matchobject[teamarray].length) {
          livematchaddrank(matchobject, function(err, newmatchobject) {
            if (err) {
              cb(err);
            } else {
              cb(false, newmatchobject);
            }
          });
        }
        callback();
      }
    });

  });

}


function livematchaddrank(matchobject, cb) {
  var teamarray;
  var otherarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
    otherarray = "redplayers";
  } else {
    teamarray = "redplayers";
    otherarray = "blueplayers";
  }
  var loops = 0;
  async.forEachOf(matchobject[teamarray], function(value, l, callback) {

    request(urlgetrank + matchobject[teamarray][l].summonerid + "?api_key=" + lol_api, function(error, response, body) {
      if (response.statusCode == 503) {
        cb('Riot ddragon servers down! Check the riot api discord server. ** 503 response code **');
      } else if (response.statusCode == 404) {
        cb('404 in urlgetrank link');
      } else if (!error && response.statusCode == 200) {
        var importedJSON = JSON.parse(body);
        for (var i = 0; i < importedJSON.length; i++) {
          if (matchobject.gametype == 'Ranked Solo' && importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
            matchobject[teamarray][l].tier = importedJSON[i].tier;
            matchobject[teamarray][l].rank = importedJSON[i].rank;
            matchobject[teamarray][l].wins = importedJSON[i].wins;
            matchobject[teamarray][l].losses = importedJSON[i].losses;
            matchobject[teamarray][l].hotStreak = importedJSON[i].hotStreak;
            break;
          } else if (matchobject.gametype == 'Ranked Flex' && importedJSON[i].queueType == 'RANKED_FLEX_SR') {
            matchobject[teamarray][l].tier = importedJSON[i].tier;
            matchobject[teamarray][l].rank = importedJSON[i].rank;
            matchobject[teamarray][l].wins = importedJSON[i].wins;
            matchobject[teamarray][l].losses = importedJSON[i].losses;
            matchobject[teamarray][l].hotStreak = importedJSON[i].hotStreak;
            break;
          } else {
            matchobject[teamarray][l].tier = "Pre level 30 or doesn't play ranked";
            matchobject[teamarray][l].rank = "";
            matchobject[teamarray][l].wins = 0;
            matchobject[teamarray][l].losses = 1;
            matchobject[teamarray][l].hotStreak = false;
          }
        }
        if (importedJSON.length = 0) {
          matchobject[teamarray][l].tier = "Pre level 30 or doesn't play ranked";
          matchobject[teamarray][l].rank = "";
          matchobject[teamarray][l].wins = 0;
          matchobject[teamarray][l].losses = 1;
          matchobject[teamarray][l].hotStreak = false;
        }
        loops++;
        var loops1 = 0;
        if (loops == matchobject[teamarray].length) {
          teamarray = otherarray;
          async.forEachOf(matchobject[teamarray], function(value, j, callback) {

            request(urlgetrank + matchobject[teamarray][j].summonerid + "?api_key=" + lol_api, function(error, response, body) {
              if (response.statusCode == 503) {
                cb('Riot ddragon servers down! Check the riot api discord server. ** 503 response code **');
              } else if (response.statusCode == 404) {
                cb('404 in urlgetrank link');
              } else if (!error && response.statusCode == 200) {
                var importedJSON = JSON.parse(body);
                for (var i = 0; i < importedJSON.length; i++) {
                  if (matchobject.gametype == 'Ranked Solo' && importedJSON[i].queueType == 'RANKED_SOLO_5x5') {
                    matchobject[teamarray][j].tier = importedJSON[i].tier;
                    matchobject[teamarray][j].rank = importedJSON[i].rank;
                    matchobject[teamarray][j].wins = importedJSON[i].wins;
                    matchobject[teamarray][j].losses = importedJSON[i].losses;
                    matchobject[teamarray][j].hotStreak = importedJSON[i].hotStreak;
                    break;
                  } else if (matchobject.gametype == 'Ranked Flex' && importedJSON[i].queueType == 'RANKED_FLEX_SR') {
                    matchobject[teamarray][j].tier = importedJSON[i].tier;
                    matchobject[teamarray][j].rank = importedJSON[i].rank;
                    matchobject[teamarray][j].wins = importedJSON[i].wins;
                    matchobject[teamarray][j].losses = importedJSON[i].losses;
                    matchobject[teamarray][j].hotStreak = importedJSON[i].hotStreak;
                    break;
                  } else {
                    matchobject[teamarray][j].tier = "Pre level 30 or doesn't play ranked";
                    matchobject[teamarray][j].rank = "";
                    matchobject[teamarray][j].wins = 0;
                    matchobject[teamarray][j].losses = 1;
                    matchobject[teamarray][j].hotStreak = false;
                  }
                }
                if (importedJSON.length = 0) {
                  matchobject[teamarray][j].tier = "Pre level 30 or doesn't play ranked";
                  matchobject[teamarray][j].rank = "";
                  matchobject[teamarray][j].wins = 0;
                  matchobject[teamarray][j].losses = 1;
                  matchobject[teamarray][j].hotStreak = false;
                }
                loops1++;
                if (loops1 == matchobject[teamarray].length) {
                  cb(false, matchobject);
                }
                callback();

              }
            });

          });


        }
        callback();
      }
    });

  });

}

function saveitemphotos(fitems_h, fitems_w, sitems_h, sitems_w, cb) {
  var fitems_h_itemarray = fitems_h.hash.split("-");
  var fitems_w_itemarray = fitems_w.hash.split("-");
  var sitems_h_itemarray = sitems_h.hash.split("-");
  var sitems_w_itemarray = sitems_w.hash.split("-");
  saveImages(fitems_h_itemarray, function() {
    saveImages(fitems_w_itemarray, function() {
      saveImages(sitems_h_itemarray, function() {
        saveImages(sitems_w_itemarray, function() {
          sortimages(fitems_h_itemarray, fitems_w_itemarray, sitems_h_itemarray, sitems_w_itemarray, function() {
            cb();
          });
        });
      });
    });
  });
}

function saveImages(array, cb) {

  var key = 1;
  var max = array.length;
  while (key != max) {
    options.url = 'http://ddragon.leagueoflegends.com/cdn/6.24.1/img/item/' + array[key] + '.png';

    download.image(options)
      .then(({
        filename,
        image
      }) => {
        console.log('File saved to', filename)
      }).catch((err) => {
        throw err

      })
    key++;
    if (key == max) {
      cb();
    }
  }

}



function sortimages(array1, array2, array3, array4, cb) {
  console.log("started combining images");
  combineimages(array1, 'playratefinal.jpg', function() {
    combineimages(array2, 'winratefinal.jpg', function() {
      combineimages(array3, 'playratestart.jpg', function() {
        combineimages(array4, 'winratestart.jpg', function() {
          cb();
        });
      });
    });
  });



  console.log(array1, array2, array3, array4);
  console.log(array1.length, array2.length, array3.length, array4.length);

}

function combineimages(array, filename, cb) {
  var num = 0
  switch (array.length) {
    case 0:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
        });
      break;
    case 1:
      gm()
        .in('-page', '+0+0')
        .minify()
        .mosaic()
        .write(filename, function(err) {
          if (err) console.log(err);
          else {
            cb();
          }
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
          else {
            cb();
          }
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
          else {
            cb();
          }
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
          else {
            cb();
          }
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
          else {
            cb();
          }
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
          else {
            cb();
          }
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
          else {
            cb();
          }
        });
  }
}

function test(message) {
  message.channel.send("test");
}

function printbuild(message, args, championggobject) {
  message.reply("the builds for **" + args + " **" + "in the **" + championggobject.role + "** lane from champion.gg");
  message.channel.send("**Highest Play-Rate Build**" + " (number of games: **" + championggobject.finalitemshighgames + "** , winrate: **" + championggobject.finalitemshighwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/playratefinal.jpg'
  });
  message.channel.send("**Highest Win-Rate Build**" + " (number of games: **" + championggobject.finalitemswingames + "** , winrate: **" + championggobject.finalitemswinwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/winratefinal.jpg'
  });

  message.channel.send("**Highest Play-Rate Starting Items**" + " (number of games: **" + championggobject.startingitemshighgames + "** , winrate: **" + championggobject.startingitemshighwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/playratestart.jpg'
  });
  message.channel.send("**Highest Win-Rate Starting Items**" + " (number of games: **" + championggobject.startingitemswingames + "** , winrate: **" + championggobject.startingitemswinwinrate.toFixed(2) + "**% )", {
    file: 'C:/jeff/Kennen-bot/winratestart.jpg'
  });

}

function matchmessage(message, matchobject, summonerobject) {
  var teamarray;
  var yourarray;
  if (matchobject.team == 'RED') {
    teamarray = "blueplayers";
    yourarray = "redplayers";
  } else {
    teamarray = "redplayers";
    yourarray = "blueplayers";
  }
  var enemyteam = "";
  var yourteam = "";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    var num = matchobject[teamarray][i].wins / (matchobject[teamarray][i].losses + matchobject[teamarray][i].wins);
    var winrate = roundTo(num, 2);
    enemyteam += "**" + matchobject[teamarray][i].summonername + "** ----- **" + matchobject[teamarray][i].championname + "**" + " ----- Rank: **" + matchobject[teamarray][i].tier + " " + matchobject[teamarray][i].rank + " ** ----- Winrate: **" + winrate + "%**\n";
  }
  for (var i = 0; i < matchobject[yourarray].length; i++) {
    var num = matchobject[yourarray][i].wins / (matchobject[yourarray][i].losses + matchobject[yourarray][i].wins);
    var winrate = roundTo(num, 2);
    yourteam += "**" + matchobject[yourarray][i].summonername + "** ----- **" + matchobject[yourarray][i].championname + "**" + " ----- Rank: **" + matchobject[yourarray][i].tier + " " + matchobject[yourarray][i].rank + " ** ----- Winrate: **" + winrate + "%**\n";
  }
  var watchout = "";
  var mains = "These players are playing their main: ";
  var mastery = "These players have >50000 mastery points on their champ: ";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    if (matchobject[teamarray][i].mostplayed) {
      mains += "** " + matchobject[teamarray][i].summonername + "**(** " + matchobject[teamarray][i].championname + "**), ";
    } else if (matchobject[teamarray][i].masterypoints > 50000) {
      mastery += "** " + matchobject[teamarray][i].summonername + "**(** " + matchobject[teamarray][i].championname + "**), ";
    }
  }

  watchout += mains + "\n" + mastery;

  var highranks = "";
  for (var i = 0; i < matchobject[teamarray].length; i++) {
    if (matchobject[teamarray][i].tier == "PLATINUM" || matchobject[teamarray][i].tier == "DIAMOND" || matchobject[teamarray][i].tier == "MASTER" || matchobject[teamarray][i].tier == "CHALLENGER") {
      highranks += "**" + matchobject[teamarray][i].summonername + "**(** " + matchobject[teamarray][i].championname + "**), ";
    }

  }



  const embed = new Discord.RichEmbed()
    .setTitle('Live Match Info for **' + summonerobject.name + "**")
    .setAuthor(summonerobject.name, "http://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + summonerobject.profileid + ".png")
    .setDescription(matchobject.gametype + " on " + matchobject.map + " **" + matchobject.time + " **in game")
    .addField("Enemy Team", enemyteam, true)
    .addField("Your Team", yourteam, true)
    .addField("Enemy Players to Watch", watchout, true)
    .addField("High Ranked Enemy Players", highranks, true)
    .setColor(12717994)


  message.channel.send({
    embed
  });
}
