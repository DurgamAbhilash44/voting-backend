const express = require('express');
const User = require('./../model/User');
const { AuthMiddleware, generateToken } = require('./../jwt');

const router = express.Router();

// Route to save a new User
router.post('/register', async (req, res) => {
    try {
        const data = req.body;
        const newUser = new User(data);

        const savedUser = await newUser.save();

        const payload = {
            id: savedUser._id,  // Use _id from MongoDB
            username: savedUser.username
        };

        const token = generateToken(payload);
        console.log(token);

        res.status(200).json({ saved: savedUser, token: token });
    } catch (err) {
        // Send a detailed error message
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

        console.log(token);

        // Send the token in the response
        res.status(200).json({ token });

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
