import React, { useState, useEffect } from 'react';
import '@picocss/pico';

// Order is relevant as pilot rows are hardcoded
const headings = [
  'First name',
  'Last name',
  'Email',
  'Phone number',
  'Closest confirmed distance',
  'Last seen',
];

const TableHead = ({ headings }) => (
  <thead>
    <tr>
      {headings.map(
        (heading, i) => <th key={i} scope='column'>{heading}</th>
      )}
    </tr>
  </thead>
);

const TableRow = ({ pilot }) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    distance,
    timestamp: lastSeen,
  } = pilot
  return (
    <tr>
      <td>{firstName}</td>
      <td>{lastName}</td>
      <td>{email}</td>
      <td>{phoneNumber}</td>
      <td>{formatDistance(distance)}</td>
      <td>{formatTimestamp(lastSeen)}</td>
    </tr>
  )
};

const formatDistance = distance => {
  const str = distance.toString();
  if (distance < 1000) {
    return `${distance} millimeters`;  
  }
  const length = str.length;
  return `${str.slice(0, length-3)}.${str.slice(-3, length)} meters`;
}

const formatTimestamp = timestamp => new Date(timestamp).toLocaleString();

const App = () => {
  const [pilots, setPilots] = useState([]);
  const sortedPilots = [...pilots].sort((a, b) => {
    if (a.distance === b.distance) {
      return 0;
    }
    return a.distance > b.distance ? 1 : -1;
  });

  useEffect(() => {
      const events = new EventSource('/stream');
      events.onmessage = event => {
        const parsedData = JSON.parse(event.data);
        setPilots(parsedData);
      };

      return () => {
        events.close()
      };
  }, []);
  return (
    <div className='container-fluid'>
      <h2>NFZ Violators</h2>
      Sorted by ascending distance to nest
      <table>
        <TableHead headings={headings}/>
        <tbody>
          {sortedPilots.map(pilot => <TableRow key={pilot.pilotId} pilot={pilot}/>)}
        </tbody>
      </table>
    </div>
  );
};

export default App;
