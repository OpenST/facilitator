import Logger from '../src/common/Logger';

let loggerMode: boolean;

before(
  (): void => {
    loggerMode = Logger.silent;
    Logger.silent = true;
  },
);


after(
  (): void => {
    Logger.silent = loggerMode;
  },
);
