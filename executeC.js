const { exec } = require("child_process");
const path = require("path");
const outputPath = path.join(__dirname, "outputs");
const fs = require("fs");

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

const executeC = (filePath) => {
  const jobId = path.basename(filePath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.out`);
  // console.log(filePath);
  // console.log(outPath);
  // console.log(outputPath);
  // console.log(jobId);
  return new Promise((resolve, reject) => {
    exec(
      `gcc ${filePath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
        }
        if (stderr) {
          reject(stderr);
        }
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeC,
};
