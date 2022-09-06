const fs = require("fs")
const path = require("path")
const dirCodes = path.join(__dirname, "codes")
const { v4: uuidv4 } = require("uuid")

const generateFile = async (format, content) => {
  const jobId = uuidv4()
  const fileName = `${jobId}.${format}`
  const filePath = path.join(dirCodes, fileName)
  fs.writeFileSync(filePath, content)
  return filePath
}

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true })
}

module.exports = {
  generateFile,
}
