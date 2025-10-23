// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage(); // түр хадгалалт RAM дээр
const upload = multer({ storage });

export default upload;