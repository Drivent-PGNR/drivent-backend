import { Request, Response } from "express";
import httpStatus from "http-status";
import authenticationService, { SignInParams } from "@/services/authentication-service";

export async function singInPost(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;

  try {
    const result = await authenticationService.signIn({ email, password });
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function signInWithGitHub(req: Request, res: Response) {
  const { code } = req.body as Record<string, string>;

  try {
    const result = await authenticationService.signInWithGitHub(code);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
