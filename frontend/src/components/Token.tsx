import axios from 'axios';

export const API_URL = "http://localhost:3333/";

export interface TokenData {
  valid: boolean;
  username: string;
  email: string;
  fullname: string;
  role: string;
}

export async function validateToken(token: string): Promise<TokenData> {
 
  try {
    const response = await axios.post(`${API_URL}token/verify`, { token });
    return response.data;
  } catch (error) {
    console.error("Error validating token: ", error);
    throw error;
  }
}
