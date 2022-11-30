const { Client, GatewayIntentBits } = require("discord.js");
const { isAdmin, isModerator } = require("./../utils/helper");
const { updateUser, fetchUser, hasOtherRequest, fetchSuspendedUser, updateSuspendedUser } = require("./../utils/db");

let users = [];

const initializeClient = () => {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on("messageCreate", async (message) => {
    const parts = message.content.split(" ");

    if (
      message.channelId === process.env.VERIFY_CHANNEL_ID &&
      parts[0].startsWith("!")
    ) {
      const command = parts.shift().toLowerCase();

      switch (command) {
        case process.env.COMMAND_VERIFY:
          var username = parts.shift()?.toLowerCase();
          if (!username) {
            await message.reply({
              content: `\`Error\` You must add value with command to execute!`
            })
            break;
          }

          if (!!(await fetchUser(username))) {
            await message.reply(
              `\`${username}\` is already in the que.`
            );
            break;
          }

          const otherRequest = await hasOtherRequest(message.author.id);
          if (otherRequest) {
            if (otherRequest.status)
              await message.reply({
                content: `Hello, <@${message.author.id}>, you are already verified with other username \`${otherRequest.username}\`.`,
              });
            else {
              if (otherRequest.statusUpdateBy)
                await message.reply({
                  content: `Hello, <@${message.author.id}>, your request was denied earlier. Please contact admins.`,
                });
              else
                await message.reply({
                  content: `Hello, <@${message.author.id}>, you have already applied with other username \`${otherRequest.username}\`.`,
                });
            }
            break;
          }

          if (users.indexOf(message.author.id) !== -1) {
            await message.reply(
              `You are using this command too much. Try again later.`
            );
            break;
          } else {
            users.push(message.author.id);
            setTimeout(() => {
              users = users.filter((user) => user !== message.author.id);
            }, process.env.BOT_COOLDOWN_TIME);
          }

          console.log(`Adding ${username} to the verification queue`);

          try {
            await updateUser(
              username,
              `${message.author.tag} <@${message.author.id}>`,
              message.author.id,
              false,
              null,
              null
            );
            await message.reply(
              `\`${username}\` has been added to the verification queue`
            );
            console.log(`${username} has been added to the verification queue`);
          } catch (err) {}
          break;

        case process.env.COMMAND_APPROVE:
        case process.env.COMMAND_DENY:
          if (!isAdmin(message.member)) {
            await message.reply({
              content: "You are not authorized to use this command!",
            });
            break;
          }

          var username = parts.shift()?.toLowerCase();
          if (!username) {
            await message.reply({
              content: `\`Error\` You must add value with command to execute!`
            })
            break;
          }

          try {
            const user = await fetchUser(username);

            if (!!user) {
              await updateUser(
                username,
                null,
                null,
                command === process.env.COMMAND_APPROVE,
                `${message.author.tag} <@${message.author.id}>`,
                message.author.id
              );

              await message.reply(
                `Hello, <@${
                  user.requestedById
                }>, your account \`${username}\` has been ${
                  command === process.env.COMMAND_APPROVE
                    ? "verified"
                    : "denied"
                }.`
              );
            } else {
              await message.reply({
                content: `\`${username}\` is not found in the verification queue.`,
              });
            }
          } catch (err) {}
          break;

        case process.env.COMMAND_STATUS:
          if (!isAdmin(message.member)) {
            await message.reply({
              content: "You are not authorized to use this command!",
            });
            break;
          }

          var username = parts.shift()?.toLowerCase();
          if (!username) {
            await message.reply({
              content: `\`Error\` You must add value with command to execute!`
            })
            break;
          }

          try {
            const user = await fetchUser(username);

            if (!!user) {
              if (user.status) {
                await message.reply({
                  content: `\`${username}\` is verified by <@${user.statusUpdateById}> on \`${user.statusUpdateTime}\``,
                });
              } else {
                await message.reply({
                  content: `\`${username}\` is not verified.`,
                });
              }
              break;
            } else {
              await message.reply({
                content: `User \`${username}\` is not added in the verification queue!`,
              });
              break;
            }
          } catch (err) {}
          break;
        default:
          break;
        
        case process.env.COMMAND_KICK:
          if(!isModerator(message.member)) {
            await message.reply({
              content: "You are not authorized to use this command!",
            });
            break;
          }

          var username = parts.shift()?.toLowerCase();

          if(!username) {
            await message.reply({
              content: "`Error` You must add value with command to execute!"
            });
            break;
          }

          try {
            const user = await fetchSuspendedUser(username);

            if(!user) {
              await updateSuspendedUser(
                username,
                true,
                `${message.author.tag}`,
                message.author.id,
              );
              await message.reply(`\`${username}\` has been suspended by <@${message.author.id}>`);
            } else {
              if(user.status === true) {
                await message.reply(`\`Error\` ${username} is already suspended by <@${user.statusUpdateById}>`);
              } else {
                await updateSuspendedUser(
                  username,
                  true,
                  `${message.author.tag} <@${message.author.id}>`,
                  message.author.id,
                );
                await message.reply(`\`${username}\` has been suspended by <@${message.author.id}>`);
              }
            }

          } catch(err) {}

          break;
  
        case process.env.COMMAND_UNBAN:
          if(!isModerator(message.member)) {
            await message.reply({
              content: "You are not authorized to use this command!",
            });
            break;
          }

          var username = parts.shift()?.toLowerCase();

          if(!username) {
            await message.reply({
              content: "`Error` You must add value with command to execute!"
            });
            break;
          }

          try {
            const user = await fetchSuspendedUser(username);

            if(!user) {
              await message.reply(`\`Error\` username \`${username}\` is not found`);
            } else {
              if(user.status === true) {
                await updateSuspendedUser(
                  username,
                  false,
                  `${message.author.tag}`,
                  message.author.id,
                );
                await message.reply(`\`${username}\` has been unsuspended!`);
              } else {
                await message.reply(`\`Error\` \`${username}\` is not suspended`);
              }
            }

          } catch(err) {}

          break;
  
        case process.env.COMMAND_CHECK:
          if(!isModerator(message.member)) {
            await message.reply({
              content: "You are not authorized to use this command!",
            });
            break;
          }

          var username = parts.shift()?.toLowerCase();

          if(!username) {
            await message.reply({
              content: "`Error` You must add value with command to execute!"
            });
            break;
          }

          try {
            const user = await fetchSuspendedUser(username);

            if(user) {
              user.status ? message.reply(`\`${username}\` is suspended by <@${user.statusUpdateById}>`) : message.reply(`\`${username}\` is not suspended`);
            } else {
              message.reply(`\`Error\` username \`${username}\` is not found`);
            }
          } catch (err) {}

          break;
      }
    }
  });

  client.login(process.env.VERIFY_TOKEN);
};

module.exports = {
  initializeClient,
};
