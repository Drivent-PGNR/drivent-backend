import { unauthorizedError } from "@/errors";
import axios from "axios";

async function getUserGitHubInfo(code: string) {
  try {
    const token = await exchangeCodeForAccesToken(code); 
    const userGitId = await fetchUser(token);
    return (userGitId);
  } catch (error) {
    throw unauthorizedError();
  }
}

async function exchangeCodeForAccesToken(code: string) {
  const GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
  const { REDIRECT_URI, CLIENT_ID, CLIENT_SECRET } = process.env;
  const body = {
    code,
    grant_type: "authorization_code",
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  };

  const { data } = await axios.post(GITHUB_ACCESS_TOKEN_URL, body, {
    headers: {
      "Accept": "application/json"
    }
  });

  return data.access_token;
}

async function fetchUser(token: string) {
  try {
    const response = await axios.get("http://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.id; 
  } catch (error) {
    throw unauthorizedError();
  }
}

const gitHubAuthService = {
  getUserGitHubInfo
};
  
export default gitHubAuthService;
