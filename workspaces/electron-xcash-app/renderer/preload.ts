// To secure user platform when running renderer process stuff,
// Node.JS and Electron APIs are only available in this script

import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
//import { WindowApiConst } from 'shared-lib';
import * as fs from 'fs-extra';;

//contextBridge.exposeInMainWorld('api', {
//	send: <In>(channel: string, input: In) => {
//		if (WindowApiConst.SENDING_SAFE_CHANNELS.includes(channel)) {
//			ipcRenderer.send(channel, input);
//		}
//	},
//	receive: <Out>(channel: string, callback: (output: Out) => void) => {
//		// Deliberately strip event as it includes `sender`
//		ipcRenderer.on(channel, (_event: IpcRendererEvent, ...parameters: any[]) =>
//			callback(parameters[0])
//		);
//	},
//});

contextBridge.exposeInMainWorld('electronAPI', {
	send: (channel: any, data: any) => {
		ipcRenderer.send(channel, data);
	},
	on: (channel: any, callback: any) => {
		ipcRenderer.on(channel, (event, ...args) => callback(...args));
	},
});

contextBridge.exposeInMainWorld('electronFs', {
	readFileSync: fs.readFileSync,
	unlinkSync: fs.unlinkSync,
	renameSync: fs.renameSync,
	writeFileSync: fs.writeFileSync,
	existsSync: fs.existsSync
});

contextBridge.exposeInMainWorld('electronAPIs', {
	homeDir: process.env.HOME,
	userProfile: process.env.USERPROFILE,
	platform: process.platform
});