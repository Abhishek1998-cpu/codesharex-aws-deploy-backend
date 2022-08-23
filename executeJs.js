const { exec } = require("child_process");

const executeJs = (filePath) => {
  console.log("FilePath = " + filePath)
  return new Promise((resolve, reject) => {
    exec(`node ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log("Error is there")
        reject({ error, stderr });
      }
      if (stderr) {
        console.log("Stderr is there")
        reject(stderr);
      }
      console.log(stdout)
      resolve(stdout);
    });
  });
};

module.exports = {
  executeJs,
};
