const { exec } = require("child_process");

const executeJava = (filePath) => {
  console.log("FilePath = " + filePath)
  return new Promise((resolve, reject) => {
    exec(`java ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log("Error is there")
        reject({ error, stderr });
      }
      if (stderr) {
        console.log("Stderr is there")
        reject(stderr);
      }
      resolve(stdout);
    });
  });
};

module.exports = {
  executeJava,
};
