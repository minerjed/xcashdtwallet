import { app } from 'electron';
import * as os from 'node:os';
import * as path from 'node:path';
import * as winston from 'winston';
export class Logger {
    static error(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.error(message, meta);
    }
    static warn(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.warn(message, meta);
    }
    static info(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.info(message, meta);
    }
    static http(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.http(message, meta);
    }
    static verbose(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.verbose(message, meta);
    }
    static debug(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.debug(message, meta);
    }
    static silly(message, ...meta) {
        Logger.initSingleton();
        Logger.singleton._logger.silly(message, meta);
    }
    static initSingleton() {
        if (!Logger.singleton) {
            Logger.singleton = new Logger();
        }
    }
    constructor() {
        /**
         * Custom winston file format
         * Write JSON logs with given format :
         * `${timestamp} ${level} : ${info.message} : ${meta})`
         */
        this.fileFormat = winston.format.printf((data) => {
            return JSON.stringify(this.prepareLogData(data));
        });
        /**
         * Custom winston console format
         * Write logs with given format :
         * `${timestamp} ${level} : ${info.message} : JSON.stringify({ ...meta }) `
         */
        this.consoleFormat = winston.format.printf((data) => {
            const preparedData = this.prepareLogData(data);
            return (`${preparedData.timestamp} ${preparedData.level} : ` +
                `${preparedData.message} : ${JSON.stringify(preparedData.meta)}`);
        });
        this.prepareLogData = (data) => {
            const additionalData = Object.assign({}, data);
            delete additionalData.timestamp;
            delete additionalData.level;
            delete additionalData.message;
            delete additionalData.service;
            return {
                timestamp: data.timestamp,
                level: data.level,
                message: data.message,
                meta: additionalData,
            };
        };
        this._logger = winston.createLogger({
            level: 'debug',
            format: winston.format.json(),
            defaultMeta: { service: 'user-service' },
            transports: [
                new winston.transports.File({
                    filename: this.getLogFilename(),
                    level: global.appConfig.mainLogLevel,
                    format: winston.format.combine(winston.format.timestamp(), this.fileFormat),
                }),
            ],
        });
        // If we're not in production then log also to the `console` with the format:
        // `${info.timestamp} ${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        if (global.appConfig.configId === 'development') {
            this._logger.add(new winston.transports.Console({
                stderrLevels: ['error', 'warn'],
                format: winston.format.combine(winston.format.timestamp(), this.consoleFormat),
            }));
        }
    }
    /**
     * Returns log filename with standard path
     * In production, returns absolute standard path depending on platform
     */
    getLogFilename() {
        let filename = global.appConfig.mainLogFile;
        if (global.appConfig.configId === 'production') {
            const appName = app.getName();
            if (process.platform == 'linux') {
                filename = `.config/${appName}/${filename}`;
            }
            else if (process.platform == 'darwin') {
                filename = `Library/Logs/${appName}/${filename}`;
            }
            else if (process.platform == 'win32') {
                filename = `AppData\\Roaming\\${appName}\\${filename}`;
            }
        }
        return path.join(os.homedir(), filename);
    }
}
//# sourceMappingURL=logger.js.map