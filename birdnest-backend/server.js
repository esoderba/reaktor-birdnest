import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv';
import { getDrones, getPilot } from './api.js';
import getNestDistance from './util.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.static('build'));
const port = process.env.PORT || 8080;
let clients = [];
let pilots = [];

const clientHandler = (request, response) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  };
  const data = `data: ${JSON.stringify(pilots)}\n\n`;

  response.writeHead(200, headers);
  response.write(data);
  clients.push(response);

  request.on('close', () => {
    clients = clients.filter((client) => client !== response);
  });
};

app.get('/stream', clientHandler);

app.listen(port, () => {
  console.log(`Server running at port ${port}`);
});

// Fetches and processes drones
const droneHandler = async () => {
  const droneData = await getDrones() || [];
  const strippedDroneData = droneData.map((drone) => {
    const { serialNumber, positionY, positionX } = drone;
    const distance = getNestDistance(positionX, positionY);
    return {
      serialNumber,
      distance,
    };
  });

  return strippedDroneData.filter((drone) => drone.distance < 100000);
};

// Fetches and processes pilots for the supplied drone list
const pilotHandler = async (drones) => {
  drones.forEach(async ({ serialNumber, distance }) => {
    const pilotData = await getPilot(serialNumber);
    const { pilotId } = pilotData;
    const timestamp = Date.now();
    const index = pilots.findIndex((p) => p.pilotId === pilotId);
    if (index === -1) {
      pilots.push({ timestamp, distance, ...pilotData });
    } else {
      pilots[index].timestamp = timestamp;
      pilots[index].distance = Math.min(pilots[index].distance, distance);
    }
  });
  // Filter out any pilots last seen longer than 10 minutes ago
  pilots = pilots.filter(({ timestamp }) => (Date.now() - timestamp) < 600000);
};

const sendSSE = () => {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(pilots)}\n\n`);
  });
};

// Runs the handlers every 2 seconds
const runHandlers = async () => {
  const drones = await droneHandler();
  await pilotHandler(drones);
  sendSSE();
  setTimeout(runHandlers, 2000);
};
runHandlers();
