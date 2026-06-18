const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function log(level: LogLevel, event: string, details?: Record<string, unknown>) {
  if (LOG_LEVELS.indexOf(level) < LOG_LEVELS.indexOf(currentLevel)) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...(details ? { details } : {}),
  };
  const output = JSON.stringify(entry);
  if (level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

const logger = {
  debug: (event: string, details?: Record<string, unknown>) => log('debug', event, details),
  info: (event: string, details?: Record<string, unknown>) => log('info', event, details),
  warn: (event: string, details?: Record<string, unknown>) => log('warn', event, details),
  error: (event: string, details?: Record<string, unknown>) => log('error', event, details),
};

export { logger };
