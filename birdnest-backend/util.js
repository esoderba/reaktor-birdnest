const getNestDistance = (xpos, ypos) => {
  // Position values are given as milimeters, one mm precision is probably plenty, rounding to int
  const x = Math.round(xpos);
  const y = Math.round(ypos);
  return Math.round(Math.hypot(x - 250000, y - 250000));
};

export default getNestDistance;
