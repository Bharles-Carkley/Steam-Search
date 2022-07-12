import DiscordJS, {
    Intents,
    MessageEmbed
  } from 'discord.js';
  import fetch from 'node-fetch'
import fs from 'fs';

const Config = JSON.parse(fs.readFileSync('./config.json', 'utf8'))

  const client = new DiscordJS.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
  })
  
  client.on('ready', () => {
    console.log('Fuck You LUPUS')
  
    let commands
  
    commands?.create({
      name: "steam-search",
      description: "Replies with your steam profile.",
      options: [{
        name: "steam-profile",
        description: "Your steam profile.",
        required: true,
        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
      }],
    });
  })
  
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
      return
    }
  
    const {
      commandName,
      options
    } = interaction
  
    if (commandName === 'steam-search') {
      const profile = options.getString("steam-profile");
  
      if (!profile.includes('https://steamcommunity.com/profiles/') && !profile.startsWith('7')) {
        interaction.reply({
          content: "Please enter a valid steam link or ID."
        })
      }

      else {
        let url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Config.steamApiKey}&steamids=${profile}`;
  
        let settings = {
          method: "Get"
        };
    
        fetch(url, settings)
          .then(res => res.json())
          .then((json) => {
            console.log(json.response.players)
    
            if (json.response.players.length === 0) {
              interaction.reply("That steam profile does not exist.")
            } else {
              const embed = new MessageEmbed()
                .setColor('BLUE')
                .setTitle('Steam Profile')
                .setThumbnail(json.response.players[0].avatarfull)
                .addFields(
                  {
                  name: `Steam Name`,
                  inline: true,
                  value: json.response.players[0].personaname
                }, 
                {
                  name: `Steam ID`,
                  inline: true,
                  value: json.response.players[0].steamid
                }, {
                  name: `Steam URL`,
                  inline: false,
                  value: json.response.players[0].profileurl
                }, {
                  name: `Steam Country`,
                  inline: true,
                  value: json.response.players[0].loccountrycode
                }, {
                  name: `Steam State`,
                  inline: true,
                  value: json.response.players[0].locstatecode
                }, {
                  name: `Created At`,
                  inline: true,
                  value: `<t:${json.response.players[0].timecreated}>`
                })
              interaction.reply({
                embeds: [embed]
              })
            }
          })
      }
    }
  })
  
  client.login(Config.token)