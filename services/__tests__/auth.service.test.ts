import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/errors";

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

const bcryptMock = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const jwtMock = vi.hoisted(() => ({
  sign: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("bcrypt", () => ({
  default: bcryptMock,
}));

vi.mock("jsonwebtoken", () => ({
  default: jwtMock,
}));

import { login, signup } from "@/services/auth.service";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    bcryptMock.hash.mockResolvedValue("hashed-password");
    bcryptMock.compare.mockResolvedValue(true);
    jwtMock.sign.mockReturnValue("jwt-token");
  });

  describe("signup", () => {
    it("creates a new user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await signup({
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
      });

      expect(user.email).toBe("alice@example.com");
      expect(bcryptMock.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("rejects duplicate email", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing",
        email: "alice@example.com",
      });

      await expect(
        signup({
          name: "Alice",
          email: "alice@example.com",
          password: "password123",
        }),
      ).rejects.toMatchObject({
        message: "User already exists",
        statusCode: 409,
      });
    });
  });

  describe("login", () => {
    it("returns user and token on valid credentials", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        passwordHash: "hashed-password",
      });

      const result = await login({
        email: "alice@example.com",
        password: "password123",
      });

      expect(result.user.id).toBe("user-1");
      expect(result.token).toBe("jwt-token");
    });

    it("rejects invalid password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        passwordHash: "hashed-password",
      });
      bcryptMock.compare.mockResolvedValue(false);

      await expect(
        login({
          email: "alice@example.com",
          password: "wrong-password",
        }),
      ).rejects.toMatchObject({
        message: "Invalid email or password",
        statusCode: 401,
      });
    });

    it("rejects unknown email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        login({
          email: "missing@example.com",
          password: "password123",
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
