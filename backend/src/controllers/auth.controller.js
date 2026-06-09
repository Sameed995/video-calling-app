import User from "../models/User.js";
import jwt from "jsonwebtoken";


export async function signup(req, res) {
    const { fullName, email, password } = req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: "Email already in use" });
        }

        const index = Math.floor(Math.random() * 100) + 1;
        const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;

        const newUser = await User.create({
            fullName,
            email,
            password,
            profilePic: randomAvatar
        });

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

         res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
         })

         res.status(201).json({success: true, message: "User created successfully", user: newUser });

    }   
    catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error" }); 
    }
}

export async function login(req, res) {
    res.send("Login route");
}           

export function logout(req, res) {
    res.send("Logout route");
} 