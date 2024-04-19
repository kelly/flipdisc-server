function lastPoints(history) {
  return history.slice(-1).map(data => data.position);
}

function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function angle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function velocity(p1, p2, timestamp) {
  const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  const time = Date.now() - timestamp;
  return distance / time;
}

function avgAngle(position, history) {
  if (history.length < 2) return 0;

  const last = lastPoints(history);
  last.push(position);

  const angles = [];
  for (let i = 1; i < last.length; i++) {
    const a = angle(last[i - 1], last[i]);
    angles.push(a < 0 ? a + 360 : a);
  }

  return avg(angles);
}

function avgVelocity(position, history) {
  if (history.length < 2) return 0;

  const last = lastPoints(history);
  last.push(position);

  const velocities = [];
  for (let i = 1; i < last.length; i++) {
    const v = velocity(last[i - 1], last[i], history[history.length - 1].timestamp);
    velocities.push(v);
  }

  return avg(velocities);
}

export { angle, velocity, avgAngle, avgVelocity }