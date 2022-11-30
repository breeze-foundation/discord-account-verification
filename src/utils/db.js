const mongoose = require("mongoose");
const { UserModel } = require("../models/User");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (err) {
    console.error("Couldn't connect to MongoDB instance!", err);
    process.exit(1);
  }
};

const fetchUser = async (username) => {
  try {
    const user = await UserModel.findOne({ username });
    return user;
  } catch (err) {
    console.error(
      `An error occurred while fetching the user ${username}.`,
      err
    );
    return false;
  }
};

const hasOtherRequest = async (requestedById) => {
  try {
    const user = await UserModel.findOne({ requestedById });
    return user;
  } catch (err) {
    console.error(
      `An error occurred while checking if <@${requestedById}> has requested a verification before`,
      err
    );
    return false;
  }
};

const updateUser = async (
  username,
  requestedBy,
  requestedById,
  status,
  statusUpdateBy,
  statusUpdateById
) => {
  try {
    await UserModel.findOneAndUpdate(
      { username },
      {
        ...(requestedBy !== null && { requestedBy }),
        ...(requestedById !== null && { requestedById }),
        status,
        statusUpdateBy,
        statusUpdateById,
        statusUpdateTime: new Date()
          .toString()
          .split(" ")
          .splice(0, 5)
          .join(" "),
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log(`Updated the status of user ${username} as ${status}.`);
    return true;
  } catch (err) {
    console.error("An error occurred while updating the user!", err);
    return false;
  }
};

const fetchSuspendedUser = async (username) => {
  try {
    const user = await SuspendedUserModel.findOne({ username });
    return user;
  } catch (err) {
    console.error(
      `An error occured while fetching the user ${username}.`,
      err
    );
    return false;
  }
}

const updateSuspendedUser = async (
  username,
  status,
  statusUpdateBy,
  statusUpdateById
) => {
  try {
    await SuspendedUserModel.findOneAndUpdate(
      { username },
      {
        username,
        status,
        statusUpdateBy,
        statusUpdateById,
        statusUpdateTime: new Date()
          .toString()
          .split(" ")
          .splice(0, 5)
          .join(" "),
      },
      {
        new: true,
        upsert: true,
      }
    );

    console.log(`Updated the suspension status of user ${username} as ${status}.`);
    return true;
  } catch (err) {
    console.error("An error occurred while updating the user's suspension status!", err);
    return false;
  }
}

module.exports = {
  connectDatabase,
  fetchUser,
  hasOtherRequest,
  updateUser,
  fetchSuspendedUser,
  updateSuspendedUser,
};
