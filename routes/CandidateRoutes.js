const express = require('express');
const Candidate = require('./../model/Candidate');
const User = require('./../model/User');  // Assuming the User model is being used for role checks
const { AuthMiddleware, generateToken } = require('./../jwt');

const router = express.Router();

// Check if the user has admin role
const adminRole = async (userId) => {
    try {
        const user = await User.findById(userId);  // Check the role from the User model
        return user && user.role === 'admin';  // Return true if user has admin role
    } catch (error) {
        return false;  // If there's an error (e.g., user not found), return false
    }
};

// Route to save a new Candidate
router.post('/admin', AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.user;  // Extract user ID from the JWT token

        const isAdmin = await adminRole(id);  // Check if the user has admin role

        if (!isAdmin) {
            return res.status(403).json({ message: "Role is not admin" });
        }

        const data = req.body;  // Candidate data from the request body
        const newCandidate = new Candidate(data);  // Create a new Candidate instance

        const savedCandidate = await newCandidate.save();  // Save the new candidate

        res.status(200).json({ saved: savedCandidate });  // Respond with saved candidate data
    } catch (err) {
        res.status(500).json({ message: "Error occurred while saving", error: err.message });
    }
}); // ✅ This closing brace and parenthesis were missing


    router.get('/allcandidates', AuthMiddleware,async (req, res) => {
        try {
            
        

            const candidates = await Candidate.find();  // Fetch all candidates from the database

            res.status(200).json({ candidates });  // Respond with the list of candidates
        } catch (error) {
            
            console.error(error);  // Log the error for debugging
            res.status(500).json({ message: 'Error occurred while fetching candidates', error: error.message });
        }

    })

// Route to update an existing Candidate
router.put('/:candidateId', AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.user;  // Extract user ID from the JWT token
        const isAdmin = await adminRole(id);  // Check if the user has admin role

        if (!isAdmin) {
            return res.status(403).json({ message: "Role is not admin" });
        }

        const { candidateId } = req.params;  // Get the candidate ID from the route params
        const data = req.body;  // New data to update the candidate

        const response = await Candidate.findByIdAndUpdate(candidateId, data, {
            new: true,  // Return the updated document
            runValidators: true,  // Run validation before update
        });

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate updated successfully', candidate: response });
    } catch (err) {
        res.status(500).json({ message: 'Error occurred while updating candidate', error: err.message });
    }
});

// Route to delete an existing Candidate
router.delete('/:candidateId', AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.user;  // Extract user ID from the JWT token
        const isAdmin = await adminRole(id);  // Check if the user has admin role

        if (!isAdmin) {
            return res.status(403).json({ message: "Role is not admin" });
        }

        const { candidateId } = req.params;  // Get the candidate ID from the route params

        const response = await Candidate.findByIdAndDelete(candidateId);  // Delete the candidate by ID

        if (!response) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        res.status(200).json({ message: 'Candidate deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error occurred while deleting candidate', error: err.message });
    }
});

router.post('/vote/:candidateId', AuthMiddleware, async (req, res) => {
    try {
        const { candidateId } = req.params;  // Get the candidate ID from route parameters
        const userId = req.user.id;  // Get the authenticated user ID from the token

        // Find the candidate by ID
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Prevent admins from voting
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admin cannot vote" });
        }

        // Check if the user has already voted
        if (user.isVoted) {
            return res.status(403).json({ message: "You have already voted" });
        }

        // Add the user's vote to the candidate's votes
        candidate.votes.push({ user: userId });
        candidate.voteCount++;  // Increment the vote count

        // Save the updated candidate data
        await candidate.save();

        // Mark the user as having voted
        user.isVoted = true;
        await user.save();

        // Respond with the updated candidate data
        res.status(200).json({ message: "Vote successfully recorded", candidate });

    } catch (err) {
        console.error(err);  // Log the error for debugging
        res.status(500).json({ message: "Error occurred while voting", error: err.message });
    }
});

router.get('/vote/count',AuthMiddleware, async (req, res) => {
    try {
        const { id } = req.user;  // Extract user ID from the JWT token
        const isAdmin = await adminRole(id);  // Check if the user has admin role

        if (!isAdmin) {
            return res.status(403).json({ message: "Role is not admin" });
        }
        // Get the candidates sorted by vote count in descending order
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });

        // Create an array of objects with party name and vote count
        const countRecord = candidates.map(data => {
            return {
                party: data.party,
                count: data.voteCount
            };
        });

        // Respond with the vote count record
        res.status(200).json({ countRecord });

    } catch (error) {
        // Log the error and return an appropriate response
        console.error(error);
        res.status(500).json({ message: 'Error occurred while fetching vote count', error: error.message });
    }
});





module.exports = router;
