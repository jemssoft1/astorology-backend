import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../database/repositories/UserRepository";
import {
  toUserResponse,
  UserRole,
  User,
} from "../../database/models/User.model";
import { asyncHandler } from "../middleware/errorHandler.middleware";
import { authRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
const SESSION_DURATION = process.env.JWT_EXPIRY || "2h";
const REFRESH_DURATION = process.env.JWT_REFRESH_EXPIRY || "7d";

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "Username already exists",
      });
    }

    const existingEmail = await UserRepository.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        error: "Email already registered",
      });
    }

    // Create user
    const user = await UserRepository.create({
      username,
      email,
      password,
      role: UserRole.USER,
    });

    // Generate tokens
    const accessToken = jwt.sign(toUserResponse(user) as object, JWT_SECRET, {
      expiresIn: SESSION_DURATION,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_DURATION,
    } as jwt.SignOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      refreshToken,
      expiresIn: SESSION_DURATION,
      user: toUserResponse(user),
    });
  }),
);

/**
 * POST /api/auth/login
 * User login with database validation
 */
router.post(
  "/login",
  authRateLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    if ((!username && !email) || password === undefined) {
      return res.status(400).json({
        success: false,
        error: "Username/email and password are required",
      });
    }

    // Find user by username or email
    let user: User | null = null;
    if (username) {
      user = await UserRepository.findByUsername(username);
    } else if (email) {
      user = await UserRepository.findByEmail(email);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Special handling for guest user with empty password
    if (
      user.role === UserRole.GUEST &&
      user.passwordHash === "" &&
      password === ""
    ) {
      // Allow guest login with empty password
      await UserRepository.updateLastLogin(user.id);
    } else {
      // Validate password using database method
      const validatedUser = await UserRepository.validateCredentials({
        username: user.username,
        password,
      });

      if (!validatedUser) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      user = validatedUser; // Use the validated user
    }

    // Generate tokens
    const accessToken = jwt.sign(toUserResponse(user) as object, JWT_SECRET, {
      expiresIn: SESSION_DURATION,
    } as jwt.SignOptions);
    const refreshToken = jwt.sign(
      { id: user.id } as object,
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_DURATION } as jwt.SignOptions,
    );

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      expiresIn: SESSION_DURATION,
      user: toUserResponse(user),
    });
  }),
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token required",
      });
    }

    try {
      const decoded: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      const user = await UserRepository.findById(decoded.id);

      if (!user) {
        return res.status(403).json({
          success: false,
          error: "User not found",
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(toUserResponse(user) as object, JWT_SECRET, {
        expiresIn: SESSION_DURATION,
      } as jwt.SignOptions);

      res.json({
        success: true,
        accessToken,
        expiresIn: SESSION_DURATION,
      });
    } catch (err) {
      res.status(403).json({
        success: false,
        error: "Invalid refresh token",
      });
    }
  }),
);

/**
 * GET /api/auth/verify
 * Verify current token validity
 */
router.get("/verify", (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, valid: false });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        valid: false,
        error: "Token expired or invalid",
      });
    }
    res.json({ success: true, valid: true, user });
  });
});

/**
 * POST /api/auth/change-password
 * Change user password (requires authentication)
 */
router.post(
  "/change-password",
  asyncHandler(async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await UserRepository.validateCredentials({
      username: decoded.username,
      password: currentPassword,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    await UserRepository.updatePassword(user.id, newPassword);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  }),
);

/**
 * POST /api/auth/logout
 * Logout user (client should discard tokens)
 */
router.post("/logout", (req: Request, res: Response) => {
  // In a stateless JWT system, logout is handled client-side
  // Could implement token blacklist here if needed
  res.json({
    success: true,
    message: "Logout successful. Please discard your tokens.",
  });
});

export default router;
