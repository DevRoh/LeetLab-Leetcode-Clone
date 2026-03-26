import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(401).json({ message: "Please provide all fields" });
  }
  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User already exists", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: UserRole.USER,
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(201).json({
      message: "User created Successfully",
      user: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        image: newUser.image,
      },
      success: true,
    });
  } catch (error) {
    console.error("Error creating user: ", error);
    res.status(500).json({
      error: "Error creating user",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(401)
      .json({ message: "Please provide all the credentials" });
  }
  try {
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });
    if (!email) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMatched = await bcrypt.compare(password,user.password)

    if(!isMatched) {
      res.status(401).json({error:"Invalid credentials"})
    }

    const token  = jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:'7d'})
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.status(200).json({
      message: "User logged-in Successfully",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
      success: true,
    });

  } catch (error) {
    console.error("Error logging in user: ", error);
    res.status(500).json({
      error: "Error logging in user",
    });
  }
};

export const logout = async (req, res) => {};

export const check = async (req, res) => {};
