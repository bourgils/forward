export const isRunningWithSudo = () => {
  try {
    return process.platform !== 'win32' && process.getuid && process.getuid() === 0;
  } catch {
    return false;
  }
};
