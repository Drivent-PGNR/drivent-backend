import sessionRepository from "@/repositories/session-repository";
import userRepository from "@/repositories/user-repository";
import { exclude } from "@/utils/prisma-utils";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userService from "../users-service";
import { invalidCredentialsError } from "./errors";
import { v4 as uuidv4 } from "uuid";
import gitHubAuthService from "../gitHubAuth-service";

async function signIn(params: SignInParams): Promise<SignInResult> {
  const { email, password } = params;

  const user = await getUserOrFail(email);

  await validatePasswordOrFail(password, user.password);

  const token = await createSession(user.id);

  return {
    user: exclude(user, "password"),
    token,
  };
}

async function signInWithGitHub(code: string) {
  const { id } = await gitHubAuthService.getUserGitHubInfo(code);
  const email = `${id}@github.com`;

  let user = await userRepository.findByEmail(email);
  let newUser = false;
  if (!user) {
    newUser = true;
    const password = uuidv4();
    user = await userService.createUser({ email, password });
  }

  const token = await createSession(user.id);

  return {
    newUser,
    user: exclude(user, "password"),
    token,
  };
}

async function getUserOrFail(email: string): Promise<GetUserOrFailResult> {
  const user = await userRepository.findByEmail(email);
  if (!user) throw invalidCredentialsError();

  return user;
}

async function createSession(userId: number) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  await sessionRepository.create({
    token,
    userId,
  });

  return token;
}

async function validatePasswordOrFail(password: string, userPassword: string) {
  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) throw invalidCredentialsError();
}

export type SignInParams = Pick<User, "email" | "password">;

type SignInResult = {
  user: Pick<User, "id" | "email">;
  token: string;
};

type GetUserOrFailResult = Pick<User, "id" | "email" | "password">;

const authenticationService = {
  signIn,
  signInWithGitHub
};

export default authenticationService;
export * from "./errors";
