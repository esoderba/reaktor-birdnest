import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import { DRONE_URL, PILOT_URL } from './config.js';

const request = async (url, headerConfig) => fetch(url, {
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  headers: headerConfig,
});

const parser = new XMLParser();
const getDrones = async () => {
  const headers = {
    Accept: 'application/xml',
    'Content-Type': 'application/xml',
  };
  const response = await request(DRONE_URL, headers);
  const rawXml = await response.text();
  const parsedData = parser.parse(rawXml);
  const drones = parsedData?.report?.capture?.drone;
  return drones;
};

const getPilot = async (serialNumber) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const url = `${PILOT_URL}/${serialNumber}`;
  const response = await request(url, headers);
  const data = await response.json();
  return data;
};

export { getDrones, getPilot };
