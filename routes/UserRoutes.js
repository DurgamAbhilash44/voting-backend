const express = require('express');
const User = require('./../model/User');
const { AuthMiddleware, generateToken } = require('./../jwt');
const Candidate = require('../model/Candidate');

const router = express.Router();

// Route to save a new User

// Check if the user has admin role
const Role = async (userId) => {
    try {
        const user = await User.findById(userId);  // Check the role from the User model
        return user && user.role;  // Return true if user has admin role
    } catch (error) {
        return false;  // If there's an error (e.g., user not found), return false
    }
};

router.post('/register', async (req, res) => {
    try {
        const data = req.body;
        console.log("Incoming registration data:", data);

        // Check if Aadhar Card Number already exists
        const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
        if (existingUser) {
            return res.status(400).json({ message: 'Aadhar card number already registered.' });
        }

        // Create and save new user if no duplicates
        const newUser = new User(data);
        const savedUser = await newUser.save();

        // Prepare token payload
        const payload = {
            id: savedUser._id,
            name: savedUser.name // Adjust field name
        };

        const token = generateToken(payload);

        // Respond with user data and token
        res.status(200).json({ saved: savedUser, token });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Error occurred while saving", error: err.message });
    }
});


// login reques

router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        // Find the user by aadhar card number
        const user = await User.findOne({ aadharCardNumber });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the password
        const passwordMatch = await user.comparePassword(password);  // Use user instance here

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Create a payload for the token
        const payload = {
            id: user.id,
        };

        // Generate token (ensure generateToken is defined correctly)
        const token = generateToken(payload);
        const role= await Role(user.id);  // Check the role of the user
        
        const totalvoted=await User.countDocuments({isVoted:true});
        const totalusers=await User.countDocuments({role:'voter'});
        const notvoted=totalusers-totalvoted;
        const candidates=await Candidate.countDocuments(); 


    
        console.log(candidates)

        // Send the token in the response
        res.status(200).json({ token,role ,totalvoted,totalusers,notvoted,candidates });  // Include role in the response

    } catch (error) {
        // Send error with a proper message
        console.error(error);  // Log the error for debugging
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// profile route

router.get('/profile', AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.user;  // Destructuring id from the authenticated user object

        // Use findById method to find the user
        const user = await User.findById(id);  // Correct method name

        // If the user is not found, return a 404 response
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Respond with the user data (sending user object)
        res.status(200).json({ user });

    } catch (error) {
        // Send a detailed error message in case of a server issue
        console.error(error); // Optionally log the error for debugging
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});




router.put('/profile/password', AuthMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Get the user from the authenticated request
        const user = req.user;
        const userId = user.id;

        // Find the user in the database by userId (not aadharCardNumber)
        const userfind = await User.findById(userId);

        if (!userfind) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare the current password
        const passwordMatch = await userfind.comparePassword(currentPassword);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Validate new password (optional)
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        // Hash the new password before saving it
        userfind.password = newPassword; // Normally you'd hash this password before saving it
        await userfind.save();

        // Respond with success message
        res.status(200).json({ message: 'Password updated successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Error occurred while updating password', error: err.message });
    }
});



module.exports = router;
