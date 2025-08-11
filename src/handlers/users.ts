import type { Request, Response } from 'express-serve-static-core';
import { CreateUserDto } from '../dtos/CreateUser.dto';
import { CreateUserQueryParams } from '../types/query-params';
import { User as UserResponse, ErrorResponse } from '../types/response';
import { User, IUser } from '../models/User';
import bcrypt from 'bcrypt';

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
}

export async function getUserById(req: Request, res: Response) {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
}

export async function createUser(
  req: Request<{}, {}, CreateUserDto, CreateUserQueryParams>,
  res: Response<IUser | ErrorResponse>
) {
  try {
    const { name, email, password, age } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .send({ message: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age,
    });

    const savedUser = await newUser.save();

    res.status(201).send(savedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res
        .status(400)
        .send({ message: 'Validation error', error: error.message });
    }
    res.status(500).send({ message: 'Error creating user', error });
  }
}
