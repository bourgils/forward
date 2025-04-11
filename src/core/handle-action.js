export const handleAction =
  (callback) =>
  async (...args) => {
    const options = args[2];
    let script = options?.args[0];
    const cmdArgs = options?.args.slice(1);

    await callback(script, cmdArgs);
  };
