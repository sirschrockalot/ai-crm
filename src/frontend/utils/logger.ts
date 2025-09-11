/* eslint-disable no-console */
type LogMethod = (...args: unknown[]) => void;

const isProd = process.env.NODE_ENV === 'production';

const noop: LogMethod = () => {};

export const logger: {
  log: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  debug: LogMethod;
} = {
  log: isProd ? noop : console.log.bind(console),
  info: isProd ? noop : console.info.bind(console),
  warn: isProd ? noop : console.warn.bind(console),
  error: console.error.bind(console),
  debug: isProd ? noop : console.debug?.bind(console) || console.log.bind(console),
};

export default logger;


