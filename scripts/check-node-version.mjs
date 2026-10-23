const minimum = [24, 22, 1];
const current = process.versions.node.split('.').map(Number);
const supported =
  current[0] === minimum[0] &&
  (current[1] > minimum[1] ||
    (current[1] === minimum[1] && current[2] >= minimum[2]));

if (!supported) {
  throw new Error(
    `Unsupported Node.js ${process.versions.node}. Use Node.js >=24.22.1 <25 (see .nvmrc).`,
  );
}

console.info(`Node.js ${process.versions.node}: security baseline verified.`);
