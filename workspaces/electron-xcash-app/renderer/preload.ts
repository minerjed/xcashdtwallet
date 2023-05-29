// To secure user platform when running renderer process stuff,
// Node.JS and Electron APIs are only available in this script

import { contextBridge, ipcRenderer } from 'electron';
import * as fs from 'fs-extra';
import { exec } from 'child_process';

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
	platform: process.platform,
	exec: (command: string) => { exec(command); },
});