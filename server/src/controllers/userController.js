require("dotenv").config();
const User = require("../models/user");
const User_type = require("../models/user_type");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const multer = require("multer");
const Lead = require("../models/lead");
const Status = require("../models/status");

const upload = multer.memoryStorage();

async function getUsers(req, res) {
  // fetch all users with user_type populated
  try {
    const users = await User.find().populate({
      path: "user_type",
      model: "User_type",
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createUser(req, res) {
  try {
    const { name, password, email, user_type, product_type } = req.body;
    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${user_type}` });
    }

    // check if the email already exists
    const userAvailable = await User.findOne({ email });

    if (userAvailable) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Assign the user_type _id and hashed password to the user before saving
    const user = new User({
      name,
      password: hashedPassword,
      email,
      product_type,
      user_type: user_type_document._id,
    });

    // Save and return user with success message
    await user.save();
    res.status(201).json({ user, message: "User created!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user with the given email and populate the 'user_type' field
    const user = await User.findOne({ email }).populate({
      path: "user_type",
      model: "User_type",
    });

    // Check if the user exists
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Extract relevant information for the token payload
    const { _id, name: userName, email: userEmail, user_type: userType } = user;

    // Extract permissions from user_type
    const permissions = userType
      ? {
          lead: userType.lead,
          user: userType.user,
          student: userType.student,
          branch: userType.branch,
          course: userType.course,
          settings: userType.course,
        }
      : {};
    // Create JWT token with user information and permissions
    const token = jwt.sign(
      { userId: _id, userName, userEmail, userType, permissions },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Attach the decoded user information to the req object
    req.user = jwt.decode(token);

    // Return the token along with success message and user data
    res.status(200).json({
      message: "Login successful",
      token,
      _id,
      userName,
      userEmail,
      userType,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}


async function getHighestAchivedCounselors(req, res) {
  try {
    
    const RegisteredStatus = await Status.findOne({ name: 'Registered' });

    console.log(RegisteredStatus)

    const CounsellorsDesending = Lead.aggregate([
      {
        $match: {
          status_id: RegisteredStatus._id // Filter by status ID
        }
      },
      {
        $group: {
          _id: '$counsellor_id',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $lookup: {
          from: 'users', // Name of the counselor collection
          localField: 'counsellor_id',
          foreignField: '_id',
          as: 'counselor_data'
        }
      }
    ])






    if (!CounsellorsDesending) {
      return res.status(404).json({ error: "Counsellor data not found" });
    }

    res.status(200).json(CounsellorsDesending);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error });
  }
}


// update user by id
async function updateUserById(req, res) {
  try {
    const { id } = req.params;
    const { name, password, email, user_type } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Check if user_type exists in the user_type collection
    const user_type_document = await User_type.findOne({ name: user_type });

    if (!user_type_document) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${user_type}` });
    }

    // Hash the password before updating
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name,
        password: hashedPassword,
        email,
        user_type: user_type_document._id,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update user by id, user name, email, user_type and product_type only. should request name, email, user_type, product_type
async function updateUserByIdUsernameEmailUserTypeProductType(req, res) {
  try {
    const { id } = req.params;
    const { name, email, userType, product_type } = req.body;
    // check if the id is a valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Check if user_type (it is already the id) exists in the user_type collection in mongoose
    if (!mongoose.Types.ObjectId.isValid(userType)) {
      return res
        .status(400)
        .json({ error: `user_type not found: ${userType}` });
    }

    // Prepare the update data
    const updateData = {
      name,
      email,
      user_type: userType,
      product_type,
    };

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    3;

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update user by id username and password only. should request name, password, conform_password

async function updateUserByIdUsernamePassword(req, res) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // check if the id is a valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Prepare the update object with name and email
    const updateObject = {
      name,
      email,
    };

    // If profilePicture is provided, add it to the update object
    if (req.file) {
      updateObject.profilePicture = req.file.buffer.toString("base64"); // Store as base64 string
    }

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(id, updateObject, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ user: updatedUser, message: "User updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//get users by user type
async function getUsersByUserType(req, res) {
  const { user_type } = req.params;

  const user_type_document = await User_type.find({
    name: user_type.toLowerCase(),
  });

  if (!user_type_document) {
    res.status(400).json({ error: `user_type not found: ${user_type}` });
  }

  if (user_type_document[0]._id != null) {
    try {
      const users = await User.find({ user_type: user_type_document[0]._id });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching users by user_type",
      });
    }
  }
}

//get counsellors
async function getCounsellors(req, res) {
  const user_type_document = await User_type.find({ name: "counselor" });

  if (!user_type_document) {
    res.status(400).json({ error: `user_type not found: counselor` });
  }

  if (user_type_document[0]._id != null) {
    try {
      const users = await User.find({ user_type: user_type_document[0]._id });
      const counsellorDetails = [];

      for (const counsellor of users) {
        const counsellorDetail = {
          id: counsellor._id,
          label: counsellor.name,
        };
        counsellorDetails.push(counsellorDetail);
      }

      res.status(200).json(counsellorDetails);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching users by user_type",
      });
    }
  }
}

// get admin_counselors
async function getAdminCounselors(req, res) {
  const user_type_document = await User_type.find({ name: "admin_counselor" });

  if (!user_type_document) {
    res.status(400).json({ error: `user_type not found: admin_counselor` });
  }

  if (user_type_document[0]._id != null) {
    try {
      const users = await User.find({ user_type: user_type_document[0]._id });
      const counsellorDetails = [];

      for (const counsellor of users) {
        const counsellorDetail = {
          id: counsellor._id,
          label: counsellor.name,
        };
        counsellorDetails.push(counsellorDetail);
      }

      res.status(200).json(counsellorDetails);
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching users by user_type",
      });
    }
  }
}

// handle user enable and disable with status field
async function handleEnableDisable(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        status,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update password
async function updatePassword(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // check if the id is valid object id
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    // Hash the password before updating
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user by ID
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: updatedUser, message: "User updated!" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getUsers,
  createUser,
  login,
  getUserById,
  updateUserById,
  getUsersByUserType,
  handleEnableDisable,
  getCounsellors,
  updateUserByIdUsernamePassword,
  updatePassword,
  updateUserByIdUsernameEmailUserTypeProductType,
  getAdminCounselors,
  getHighestAchivedCounselors
};
