import path from 'node:path';
import os from 'node:os';

export const userConfigFileName = 'docy.user.json';

export const userConfigFilePath = path.resolve(
  os.homedir(),
  './.config/docy/',
  userConfigFileName,
);
