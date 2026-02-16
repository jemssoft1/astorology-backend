import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  CreatedAt,
  Unique,
  Default,
} from "sequelize-typescript";

/**
 * User Model - Represents authenticated users in the system
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  GUEST = "guest",
}

@Table({
  tableName: "users",
  timestamps: false,
})
export class User extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  username!: string;

  @Unique
  @Column(DataType.STRING)
  email!: string;

  @Column({ type: DataType.STRING, field: "password_hash" })
  passwordHash!: string;

  @Default(UserRole.USER)
  @Column(DataType.STRING)
  role!: UserRole;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @Column({ type: DataType.DATE, field: "last_login" })
  lastLogin?: Date;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string; // Plain password, will be hashed
  role?: UserRole;
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  role?: UserRole;
}

export interface LoginDTO {
  username: string;
  password: string;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Convert User to safe response (removes password hash)
 */
export const toUserResponse = (user: User): UserResponse => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
};
