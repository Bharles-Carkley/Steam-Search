import DiscordJS, {
  Intents,
  MessageEmbed
} from 'discord.js';
import fetch from 'node-fetch'
import fs from 'fs';
import puppeteer from 'puppeteer'

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

  async function scrapeProduct(url) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
      
    const {
      commandName,
      options
    } = interaction

    const [errorBody] = await page.$x('/html/body')
    const errorBodyName = await errorBody.getProperty('className')
    const errorBodyText = await errorBodyName.jsonValue()

    if (errorBodyText === ' responsive_page') {
      interaction.editReply({
        content: `There was an error, try a different link.`
      })
    }

    else {
    const [body] = await page.$x('/html/body')
    const bodyName = await body.getProperty('className')
    const bodyText = await bodyName.jsonValue()

    if (bodyText === ('flat_page profile_page private_profile responsive_page')) {
      const embed = new MessageEmbed()
      .setColor('RED')
      .setTitle('Steam Profile Search')
      .setDescription('Your account is private')

        interaction.editReply({
          embeds: [embed]
        })
    }

    else {
      const text = await page.evaluate(() => Array.from(document.querySelectorAll('script'), element => element.textContent));
      let spl = text[38].split(',');
      let url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Config.steamApiKey}&steamids=${spl[1]}`;
  
      let settings = {
        method: "Get"
      };
  
      fetch(url, settings)
        .then(res => res.json())
        .then((json) => { 
          if (json.response.players.length === 0) {
            interaction.editReply("That steam profile does not exist.")
          } 

          else {
            if (json.response.players[0].communityvisibilitystate === 2) {
              const embed = new MessageEmbed()
              .setColor('RED')
              .setTitle('Steam Profile Search')
              .setDescription('ACCOUNT IS PRIVATE')

              interaction.editReply({
                  embeds: [embed],
                  ephemeral: false
              })
          }
            else {
              if (json.response.players[0].loccountrycode === undefined || json.response.players[0].locstatecode === undefined) {

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
                },{
                  name: `Created At`,
                  inline: true,
                  value: `<t:${json.response.players[0].timecreated}>`
                })
              interaction.editReply({
                embeds: [embed],
                ephemeral: false
              })
              }
              else {
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
                    interaction.editReply({
                      embeds: [embed],
                      ephemeral: false
                    })
              }
            }
          }
          })

    }
    }

}

  const {
    commandName,
    options
  } = interaction

  if (commandName === 'steam-search') {
    const profile = options.getString("steam-profile");

    if (!profile.includes('https://steamcommunity.com/') && !profile.startsWith('7')) {
      interaction.reply({
        content: "Please enter a valid steam link or ID."
      })
    }

    else {
      if (profile.includes('https://steamcommunity.com/id/')) {

      await interaction.deferReply({
      })

      await scrapeProduct(profile)

    }

    else {
      let url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${Config.steamApiKey}&steamids=${profile}`;
  
      let settings = {
        method: "Get"
      };
  
      fetch(url, settings)
        .then(res => res.json())
        .then((json) => { 

          if (json.response.players.length === 0) {
              interaction.reply("That steam profile does not exist.")
            } 

            else {
              if (json.response.players[0].communityvisibilitystate === 2) {
                const embed = new MessageEmbed()
                .setColor('RED')
                .setTitle('Steam Profile Search')
                .setDescription('ACCOUNT IS PRIVATE')

                interaction.reply({
                    embeds: [embed],
                    ephemeral: false
                })
            }
              else {
                if (json.response.players[0].loccountrycode === undefined || json.response.players[0].locstatecode === undefined) {

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
                  },{
                    name: `Created At`,
                    inline: true,
                    value: `<t:${json.response.players[0].timecreated}>`
                  })
                interaction.reply({
                  embeds: [embed],
                  ephemeral: false
                })
                }
                else {
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
                        embeds: [embed],
                        ephemeral: false
                      })
                }
              }
            }
        })
    }
}}})

client.login(Config.token)