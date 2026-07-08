// Role-based access control middleware

// Check if user has one of the allowed roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. This action requires one of the following roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Check if teacher is verified (for posting official content)
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if ((req.user.role === 'teacher' || req.user.role === 'alumni') && !req.user.verified) {
    return res.status(403).json({ 
      error: 'Your account is pending admin approval. You cannot perform this action yet.' 
    });
  }

  next();
};

// Check if user owns the resource or is admin
const ownerOrAdmin = (resourceUserIdField = 'postedBy') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Admin can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    // Will be checked in the controller after fetching the resource
    req.ownerField = resourceUserIdField;
    next();
  };
};

module.exports = { authorize, requireVerified, ownerOrAdmin };
