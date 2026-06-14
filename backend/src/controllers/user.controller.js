import User from "../models/user.js";
export async function getRecommendedUsers(req, res) {
    try {
        const currentUser = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
            { _id: { $ne: currentUser._id } }, 
            { _id: { $nin: currentUser.friends } },
            {isOnboarded: true}
            ]
        })
        res.status(200).json(recommendedUsers);
        
    } catch (error) {
        console.error("Error fetching recommended users:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id).select("friends").populate
        ("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    }catch{

        console.error("Error fetching friends:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}