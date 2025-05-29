import fs from 'fs';
import path from 'path';

const logFilePath = path.join('logs', 'errors.log');

if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

const logErrorToFile = (error, req) => {
  const log = `
[${new Date().toISOString()}]
URL: ${req.originalUrl}
Method: ${req.method}
IP: ${req.ip}
Error: ${error.stack || error.message || error}
----------------------------------------------------
`;
  fs.appendFileSync(logFilePath, log);
};

export const errorHandler = (err, req, res, next) => {
  logErrorToFile(err, req);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
