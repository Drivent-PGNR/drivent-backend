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

  if (Object.values(req.body).length === 0) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }

  try {
    const result = await authenticationService.signInWithGitHub(code);
    if (result.newUser) {
      return res.status(httpStatus.CREATED).send(result);
    } else {
      return res.status(httpStatus.OK).send(result);
    }
  } catch (error) {
    return res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
