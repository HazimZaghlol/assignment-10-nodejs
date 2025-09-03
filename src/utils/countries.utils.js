import axios from "axios";

export async function getIpCountry(ip) {
  const response = await axios.get(`https://ipapi.co/${ip}/json/`);
  return response.data;
}
