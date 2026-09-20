import * as argon2 from 'argon2';
import * as jose from 'jose';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { ValidationError, UnauthorizedError, NotFoundError } from '../middleware/error.middleware.js';

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export const generateTokens = async (user: { id: string }) => {
  const accessToken = await new jose.SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(secretKey);

  const refreshToken = await new jose.SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);

  return { accessToken, refreshToken };
};

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const register = async (data: any) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new ValidationError('An account with this email already exists.');
  }

  const passwordHash = await argon2.hash(data.password);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    }
  });

  const tokens = await generateTokens(user);
  
  const { passwordHash: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword, ...tokens };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const tokens = await generateTokens(user);
  const { passwordHash: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, ...tokens };
};

export const refreshTokens = async (refreshToken: string) => {
  const payload = await verifyToken(refreshToken);
  
  if (!payload.userId) {
    throw new UnauthorizedError('Invalid token payload');
  }
  
  const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
  
  if (!user || user.status !== 'ACTIVE') {
    throw new UnauthorizedError('User not found or inactive');
  }

  return generateTokens(user);
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');
  
  const { passwordHash: _, ...profile } = user;
  return profile;
};

export const updateProfile = async (userId: string, data: any) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name }
  });
  
  const { passwordHash: _, ...profile } = user;
  return profile;
};

export const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isValid = await argon2.verify(user.passwordHash, oldPassword);
  if (!isValid) throw new UnauthorizedError('Invalid old password');

  const passwordHash = await argon2.hash(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });
};
