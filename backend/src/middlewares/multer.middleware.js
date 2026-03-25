import multer from "multer"
import fs from "fs"
import path from "path"

const tempUploadDir = path.join(process.cwd(), "public", "temp")

if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempUploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
})

export const upload = multer(
    { 
        storage, 
    }
)