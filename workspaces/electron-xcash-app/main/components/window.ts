import * as remoteMain from '@electron/remote/main';
import { app, BrowserWindow, ipcMain, nativeImage } from 'electron';
import * as path from 'node:path';
//import { AbstractService } from '../services/abstract-service';
import { Logger } from '../utils/logger';
import * as fs from 'fs-extra';

const wdir = process.platform !== "win32" ? `${process.env.HOME}/xcash-official-test-v3/` : (`${process.env.USERPROFILE}\\xcash-official-v3\\`).replace(/\\/g, "\\\\");
const rpcfile = `${wdir}useragent.txt`;

declare const global: Global;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

export class Window {
	private _electronWindow: BrowserWindow | undefined;

	constructor() {
		this.createWindow();
		this.loadRenderer();
	}

	private createWindow(): void {
		this._electronWindow = new BrowserWindow({
			width: 1280,
			height: 720, 
			backgroundColor: '#FFFFFF',
			icon: this.loadIcon(),
			webPreferences: {
				// Default behavior in Electron since 5, that
				// limits the powers granted to remote content
				// except in e2e test when those powers are required
				nodeIntegration: global.appConfig.isNodeIntegration,
				// Isolate window context to protect against prototype pollution
				// except in e2e test when that access is required
				contextIsolation: global.appConfig.isContextIsolation,
				// Introduced in Electron 20 and enabled by default
				// Among others security constraints, it prevents from required
				// CommonJS modules imports into preload script
				// which is not bundled yet in dev mode
				sandbox: global.appConfig.isSandbox,
				// Use a preload script to enhance security
				preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			},

		});

		// Disable the remote module to enhance security
		// except in e2e test when that access is required
		if (global.appConfig.isEnableRemoteModule) {
			remoteMain.enable(this._electronWindow.webContents);
		}

		// Set User Agent
		const rpcUserAgent: string = fs.readFileSync(rpcfile, 'utf8');
		this._electronWindow.webContents.userAgent = rpcUserAgent; //to set
		fs.unlinkSync(rpcfile);

		// Disable CORS
		this._electronWindow.webContents.session.webRequest.onBeforeSendHeaders(
			(details, callback) => {
				callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
			},
		);

		this._electronWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
			if (details.url.slice(0, 5) === 'http:') {
				details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
			}
			callback({ responseHeaders: details.responseHeaders });
		});

		// After registering services, add the following listener
		ipcMain.on('graceful-shutdown', (event) => {
			// Close all windows
			BrowserWindow.getAllWindows().forEach((win) => {
				win.close();
			});
		});

	}

	private loadIcon(): Electron.NativeImage | undefined {
		let iconObject;
		if (global.appConfig.isIconAvailable) {
			const iconPath = path.join(__dirname, 'icons/icon.png');
			Logger.debug('Icon Path', iconPath);
			iconObject = nativeImage.createFromPath(iconPath);
			// Change dock icon on MacOS
			if (iconObject && process.platform === 'darwin') {
				app.dock.setIcon(iconObject);
			}
		}
		return iconObject;
	}

	private loadRenderer(): void {
		if (global.appConfig.configId === 'development') {
			// Dev mode, take advantage of the live reload by loading local URL
			this.electronWindow.loadURL(`http://localhost:4200`);
		} else {
			// Else mode, we simply load angular bundle
			const indexPath = path.join(
				__dirname,
				'../renderer/angular_window/index.html'
			);
			this.electronWindow.loadURL(`file://${indexPath}`);
		}

		if (global.appConfig.isOpenDevTools) {
			this.openDevTools();
		}

		// When the window is closed`
		this._electronWindow.on('closed', () => {
			// Remove IPC Main listeners
			ipcMain.removeAllListeners();
			// Delete current reference
			delete this._electronWindow;
		});
	}

	private openDevTools(): void {
		this._electronWindow.webContents.openDevTools();
		this._electronWindow.webContents.on('devtools-opened', () => {
			this._electronWindow.focus();
			setImmediate(() => {
				this._electronWindow.focus();
			});
		});
	}

	public get electronWindow(): BrowserWindow | undefined {
		return this._electronWindow;
	}
}