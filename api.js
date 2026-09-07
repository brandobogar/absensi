import { API_URL } from "./config.js";
export async function callApi(action, data = {}) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...data }),
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { error: error.message };
  }
}