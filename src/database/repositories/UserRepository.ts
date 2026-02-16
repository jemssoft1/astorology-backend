import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import {
  User,
  CreateUserDTO,
  UpdateUserDTO,
  UserRole,
  LoginDTO,
} from "../models/User.model";
import { Op } from "sequelize";

const SALT_ROUNDS = 10;

export class UserRepository {
  /**
   * Create a new user
   */
  static async create(userData: CreateUserDTO): Promise<User> {
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const role = userData.role || UserRole.USER;

    return await User.create({
      id,
      username: userData.username,
      email: userData.email,
      passwordHash,
      role,
      createdAt: new Date(),
    });
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Validate user credentials
   */
  static async validateCredentials(loginData: LoginDTO): Promise<User | null> {
    const user = await this.findByUsername(loginData.username);

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(
      loginData.password,
      user.passwordHash,
    );

    if (!isValidPassword) return null;

    // Update last login
    await this.updateLastLogin(user.id);

    return user;
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    userData: UpdateUserDTO,
  ): Promise<User | null> {
    const user = await this.findById(id);

    if (!user) return null;

    const updatePayload: any = {};
    if (userData.username) updatePayload.username = userData.username;
    if (userData.email) updatePayload.email = userData.email;
    if (userData.role) updatePayload.role = userData.role;

    if (Object.keys(updatePayload).length > 0) {
      await user.update(updatePayload);
    }

    return user;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: string): Promise<void> {
    await User.update({ lastLogin: new Date() }, { where: { id } });
  }

  /**
   * Update password
   */
  static async updatePassword(id: string, newPassword: string): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await User.update({ passwordHash }, { where: { id } });
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const count = await User.destroy({ where: { id } });
    return count > 0;
  }

  /**
   * Get all users (admin only)
   */
  static async findAll(
    limit: number = 100,
    offset: number = 0,
  ): Promise<User[]> {
    return await User.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });
  }
}
