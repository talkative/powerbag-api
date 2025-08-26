import type { Request, Response } from 'express-serve-static-core';
import { CreateUserDto } from '../dtos/CreateUser.dto';
import { CreateUserQueryParams } from '../types/query-params';
import {
  User as UserResponse,
  ErrorResponse,
  AuthResponse,
  LoginRequest,
} from '../types/response';
import { User, IUser } from '../models/User';
import { generateToken } from '../utils/jwt';
import { sendEmail } from '../utils/mandrill';

import { HTTP_STATUS } from '../constants/httpStatusCodes';

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await User.find().select('-password'); // Exclude password from response
    res.send(users);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error fetching users', error });
  }
}

export async function getUserById(req: Request, res: Response) {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User not found' });
    }

    res.send(user);
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error fetching user', error });
  }
}

export async function createUser(
  req: Request<{}, {}, CreateUserDto, CreateUserQueryParams>,
  res: Response<IUser | ErrorResponse>
) {
  try {
    const { email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = new User({
      email,
    });

    const savedUser = await newUser.save();

    res.status(HTTP_STATUS.CREATED).send(savedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .send({ message: 'Validation error', error: error.message });
    }
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error creating user', error });
  }
}

export async function checkEmailExists(req: Request, res: Response) {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Email query parameter is required',
      } as ErrorResponse);
    }

    const user = await User.findOne({ email });
    res.status(HTTP_STATUS.OK).json({ exists: !!user });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error checking email', error } as ErrorResponse);
  }
}

export async function sendTotpEmail(req: Request, res: Response) {
  const { email, code, magicLink } = req.body;

  try {
    await sendEmail({
      to: email,
      subject: 'Your code for Powerbag login',
      template_name: 'Powerbag_signin_code',
      merge_vars: [
        {
          name: 'CODE',
          content: code,
        },
        {
          name: 'MAGICLINK',
          content: magicLink,
        },
      ],
    });

    return res.sendStatus(HTTP_STATUS.OK);
  } catch (error) {
    console.error(error);
    return res.sendStatus(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export async function loginUser(
  req: Request<{}, AuthResponse | ErrorResponse, LoginRequest>,
  res: Response<AuthResponse | ErrorResponse>
) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: 'Email are required',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(HTTP_STATUS.OK).json({
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles, // Include roles in the response
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: 'Error during login',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId); // --- IGNORE ---
    if (!deletedUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: 'User not found' });
    }
    res.status(HTTP_STATUS.OK).json({ message: 'User deleted successfully' });
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: 'Error deleting user', error });
  }
}
