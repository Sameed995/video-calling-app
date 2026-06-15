import User from "../models/user.js";
import FriendRequest from "../models/FriendRequest.js";


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

export async function sendFriendRequest(req, res) {
    try{
    const myId = req.user.id;
    const {id: recipientId} = req.params;

    //preventing sending friend request to self
    if(myId === recipientId){
        return res.status(400).json({message: "You cannot send a friend request to yourself"});
    
    }
    const recipient = await User.findById(recipientId);
    if(!recipient){
        return res.status(404).json({message: "Recipient not found"});
    }
    //preventing sending friend request to someone who is already a friend
    if (recipient.friends.includes(myId)){
        return res.status(400).json({message: "You are already friends with this user"});
    }

    //preventing sending duplicate friend requests
    const existingRequest = await FriendRequest.findOne({
        $or: [{
            sender: myId,
            recipient: recipientId,
        },
        {
            sender: recipientId,
            recipient: myId,
        }],
    });

    if(existingRequest){
        
        return res.status(400).json({message: "A friend request is already pending between you and this user"});
        
    }

    const friendRequest = await FriendRequest.create({
        sender: myId,
        recipient: recipientId,
    });

    res.status(201).json({message: "Friend request sent successfully", friendRequest});

    }catch(error){
        console.error("Error sending friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}