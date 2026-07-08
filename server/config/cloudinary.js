const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if real Cloudinary credentials are configured
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'dummy' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'dummy';

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// ── Local disk storage fallback ──────────────────────────────────────────────
const makeLocalStorage = (folder) => {
  const dir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    }
  });
};

// After a local upload, req.file.path will be an absolute OS path.
// Rewrite it to a URL-friendly relative path so the frontend can display it.
const localPathMiddleware = (subfolder) => (req, res, next) => {
  if (req.file && !req.file.path.startsWith('http')) {
    req.file.path = `/uploads/${subfolder}/${req.file.filename}`;
  }
  if (req.files) {
    req.files = req.files.map(f => {
      if (!f.path.startsWith('http')) {
        f.path = `/uploads/${subfolder}/${f.filename}`;
      }
      return f;
    });
  }
  next();
};

// ── Storage factories ─────────────────────────────────────────────────────────
const makeCloudinaryStorage = (folder, params) =>
  new CloudinaryStorage({ cloudinary, params: { folder, ...params } });

// ── Multer instances ──────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG, WEBP images are allowed'));
};

const uploadProfile = hasCloudinary
  ? multer({
      storage: makeCloudinaryStorage('collabsphere/profiles', {
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
      }),
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  : multer({ storage: makeLocalStorage('profiles'), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });

const uploadEvent = hasCloudinary
  ? multer({
      storage: makeCloudinaryStorage('collabsphere/events', {
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }]
      }),
      limits: { fileSize: 10 * 1024 * 1024 }
    })
  : multer({ storage: makeLocalStorage('events'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter });

const uploadGallery = hasCloudinary
  ? multer({
      storage: makeCloudinaryStorage('collabsphere/gallery', {
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
      }),
      limits: { fileSize: 10 * 1024 * 1024 }
    })
  : multer({ storage: makeLocalStorage('gallery'), limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: imageFilter });

const uploadDocument = hasCloudinary
  ? multer({
      storage: makeCloudinaryStorage('collabsphere/documents', {
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
        resource_type: 'auto'
      }),
      limits: { fileSize: 10 * 1024 * 1024 }
    })
  : multer({ storage: makeLocalStorage('documents'), limits: { fileSize: 10 * 1024 * 1024 } });

const uploadMemory = hasCloudinary
  ? multer({
      storage: makeCloudinaryStorage('collabsphere/memories', {
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1920, crop: 'limit', quality: 'auto:good' }]
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: imageFilter
    })
  : multer({ storage: makeLocalStorage('memories'), limits: { fileSize: 20 * 1024 * 1024 }, fileFilter: imageFilter });

module.exports = {
  cloudinary,
  uploadProfile,
  uploadEvent,
  uploadGallery,
  uploadDocument,
  uploadMemory,
  localPathMiddleware
};
