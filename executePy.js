const { exec } = require("child_process");

const executePy = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(`python3 ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      }
      if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executePy,
};
