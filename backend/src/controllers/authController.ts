import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { config } from '../config';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Top-100 most common 4-digit PINs
const WEAK_PINS = new Set([
  '0000','1111','2222','3333','4444','5555','6666','7777','8888','9999',
  '1234','4321','1122','1212','2121','0001','0002','0007','0123','1000',
  '1001','1010','1100','1110','1123','1233','1235','1313','1414','1515',
  '1520','1819','1984','2000','2001','2002','2003','2010','2012','2013',
  '2015','2016','2017','2018','2019','2020','2021','2022','2023','2024',
  '2580','2727','2911','3000','3141','3333','3456','4000','4141','4200',
  '4444','4545','4655','4815','5000','5150','5555','5683','6000','6969',
  '7000','7171','7345','7410','7777','8000','8080','8181','8282','8888',
  '9000','9191','9370','9394','9630','9999','0007','0101','0110','0202',
  '0303','0404','0505','0606','0707','0808','0909','1357','2468','1470',
]);

const RegisterSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  title: z.enum(['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.']),
  name: z.string().min(1).max(100).trim(),
  fullName: z.string().min(1).max(120).trim(),
  block: z.string().min(1).max(20),
  floor: z.enum(['2nd', '3rd', '4th', '5th', '6th', '9th']),
  cabinPosition: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  photoDataUrl: z.string().optional(),
  linkedFacultyId: z.number().int().positive().optional(),
});

const LoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  pin: z.string().length(4),
});

function signToken(email: string, role: string): string {
  return jwt.sign({ email, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = RegisterSchema.parse(req.body);

    if (WEAK_PINS.has(data.pin)) {
      res.status(400).json({ error: 'This PIN is too common. Please choose a less predictable 4-digit PIN.' });
      return;
    }

    const existing = await prisma.facultyAccount.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const pinHash = await bcrypt.hash(data.pin, 12);

    const account = await prisma.facultyAccount.create({
      data: {
        email: data.email,
        pinHash,
        title: data.title,
        name: data.name,
        fullName: data.fullName,
        block: data.block,
        floor: data.floor,
        cabinPosition: data.cabinPosition,
        phone: data.phone,
        photoDataUrl: data.photoDataUrl,
        linkedFacultyId: data.linkedFacultyId,
        role: 'faculty',
      },
    });

    const token = signToken(account.email, account.role);
    res.status(201).json({ token, account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, pin } = LoginSchema.parse(req.body);

    const account = await prisma.facultyAccount.findUnique({ where: { email } });
    if (!account) {
      res.status(401).json({ error: 'Invalid email or PIN' });
      return;
    }

    // Check lockout
    if (account.lockedUntil && account.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((account.lockedUntil.getTime() - Date.now()) / 60000);
      res.status(429).json({ error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.` });
      return;
    }

    const valid = await bcrypt.compare(pin, account.pinHash);
    if (!valid) {
      const attempts = account.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;
      await prisma.facultyAccount.update({
        where: { email },
        data: {
          failedLoginAttempts: attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
        },
      });
      if (shouldLock) {
        res.status(429).json({ error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` });
      } else {
        res.status(401).json({ error: `Invalid email or PIN. ${MAX_FAILED_ATTEMPTS - attempts} attempt${MAX_FAILED_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining.` });
      }
      return;
    }

    // Reset on success
    await prisma.facultyAccount.update({
      where: { email },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    const token = signToken(account.email, account.role);
    res.json({ token, account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const account = await prisma.facultyAccount.findUnique({
      where: { email: req.user!.email },
    });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }
    res.json({ account: sanitize(account) });
  } catch (err) {
    next(err);
  }
}

export async function changePin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      currentPin: z.string().length(4),
      newPin: z.string().length(4).regex(/^\d{4}$/, 'New PIN must be exactly 4 digits'),
    });
    const { currentPin, newPin } = schema.parse(req.body);

    if (WEAK_PINS.has(newPin)) {
      res.status(400).json({ error: 'This PIN is too common. Please choose a less predictable PIN.' });
      return;
    }

    const account = await prisma.facultyAccount.findUnique({ where: { email: req.user!.email } });
    if (!account) { res.status(404).json({ error: 'Account not found' }); return; }

    const valid = await bcrypt.compare(currentPin, account.pinHash);
    if (!valid) { res.status(401).json({ error: 'Current PIN is incorrect' }); return; }

    const pinHash = await bcrypt.hash(newPin, 12);
    await prisma.facultyAccount.update({ where: { email: req.user!.email }, data: { pinHash } });

    res.json({ message: 'PIN updated successfully' });
  } catch (err) {
    next(err);
  }
}

function sanitize(account: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { pinHash, failedLoginAttempts, lockedUntil, ...safe } = account;
  return safe;
}
