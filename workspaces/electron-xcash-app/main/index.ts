import * as fs from 'fs-extra';
import _ from 'lodash';
import * as path from 'node:path';
import { AppConfig } from 'shared-lib';
import { App } from './components/app';
import * as crypto from "crypto";
import { exec } from 'child_process';
import { WindowApiConst } from 'shared-lib';
import { app, dialog } from 'electron';

declare const global: Global;

declare global {
	// Global augmentation of the `Global` interface
	interface Global {
		appConfig: AppConfig;
	}
}
// Load config
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
	dialog.showErrorBox('An Error Occurred', 'You can not run multiple copies of this program at the same time');
	app.exit();
}
const squirrelEvent = process.argv[1];
const currentEnvironment = process.env.X_NODE_ENV || process.env.NODE_ENV;
const appConfigs = fs.readJsonSync(path.join(__dirname, 'config.json'));
const defaultConfig = appConfigs.development;
const currentConfig = appConfigs[currentEnvironment];
global.appConfig =
	currentEnvironment === 'development'
		? defaultConfig
		: _.merge(defaultConfig, currentConfig);
// Housekeeping stuff
const dbrec = '{"wallet_data": [],"contact_data": [],"wallet_settings": {"autolock": 1493,"remote_node": "seed1.xcash.tech:18281","currency": "USD"}}';
const wdir = process.platform !== "win32" ? `${process.env.HOME}/${WindowApiConst.XCASHOFFICIAL}/` : (`${process.env.USERPROFILE}\\${WindowApiConst.XCASHOFFICIAL}\\`).replace(/\\/g, "\\\\");
const rpcexe = process.platform !== "win32" ? `/usr/lib/xcashdtwallet/resources/xcash-wallet-rpc-linux` : (`${process.env.USERPROFILE}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcash-wallet-rpc-win.exe`).replace(/\\/g, "\\\\");
const rpcfile = `${wdir}useragent.txt`;
const dbfile = `${wdir}database.txt`;
const rpclog = `${wdir}xcash-wallet-rpc.log`;
// create xcash directroy
if (!fs.existsSync(wdir)) {
	fs.mkdirSync(wdir);
	const wdirOld = process.platform !== "win32" ? `${process.env.HOME}/xcash-official/` : (`${process.env.USERPROFILE}\\xcash-official\\`).replace(/\\/g, "\\\\");
	if (fs.existsSync(wdirOld)) {
		const files = fs.readdirSync(wdirOld);
		for (const file of files) {
			const srcFile = path.join(wdirOld, file);
			const destFile = path.join(wdir, file);
			if (!fs.statSync(srcFile).isDirectory()) {
				fs.copyFileSync(srcFile, destFile);
			}
		}
		const wsrec = fs.readFileSync(dbfile, "utf8");
		const wsdbrec = JSON.parse(wsrec);
		wsdbrec.wallet_settings = { "autolock": 1493, "remote_node": "seed1.xcash.tech:18281", "currency": "USD" };
		fs.writeFileSync(dbfile, JSON.stringify(wsdbrec));
	}
	if (process.platform === "win32") {
		const shortCut = `${process.env.USERPROFILE}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcashwallet.lnk`.replace(/\\/g, "\\\\");
		const desktopPath = app.getPath('desktop');
		const dtshortCut = `${desktopPath}\\xcashwallet.lnk`.replace(/\\/g, "\\\\");
		setTimeout(() => {
			fs.copyFileSync(shortCut, dtshortCut);
		}, 5000);
	}
} else {
	// Update link on windows
	if (squirrelEvent === '--squirrel-install' || squirrelEvent === '--squirrel-updated' ) {
		if (process.platform === "win32") {
			const shortCut = `${process.env.USERPROFILE}\\AppData\\Local\\xcashdtwallet\\app-${WindowApiConst.XCASHVERSION}\\resources\\xcashwallet.lnk`.replace(/\\/g, "\\\\");
			const desktopPath = app.getPath('desktop');
			const dtshortCut = `${desktopPath}\\xcashwallet.lnk`.replace(/\\/g, "\\\\");
			setTimeout(() => {
				fs.copyFileSync(shortCut, dtshortCut);
			}, 5000);
		}
	}
}
// create rpc file
const rpcUserAgent = crypto.randomBytes(100).toString('hex');
fs.writeFileSync(rpcfile, rpcUserAgent);
// check for dbfile if it does not exist create it
let rnode: string = '';
if (!fs.existsSync(dbfile)) {
	fs.writeFileSync(dbfile, dbrec);
	rnode = "seed1.xcash.tech:18281";
} else {
	const data = fs.readFileSync(dbfile, "utf8");
	const dbdata = JSON.parse(data);
	rnode = dbdata.wallet_settings.remote_node;
}
if (!fs.existsSync(rpcexe)) {
	dialog.showErrorBox('An Error Occurred', 'Can not find RPC image.');
	app.quit();
}
if (process.platform === "win32") {
	exec("taskkill /F /IM xcash-wallet-rpc-win.exe");
} else {
	exec("killall -9 'xcash-wallet-rpc-linux'");
}

console.log('squirrelEvent: ' + squirrelEvent);
if (squirrelEvent !== '--squirrel-uninstall' && squirrelEvent !== '--squirrel-obsolete') {
	setTimeout(() => {
		//Start the RPC process	
		// delete any xcash rpc log
		if (fs.existsSync(rpclog)) {
			fs.unlinkSync(rpclog);
		}
		const rpccommand: string = `${rpcexe} --rpc-bind-port 18285 --disable-rpc-login --log-level 2 --log-file ${rpclog} --wallet-dir ${wdir} --daemon-address ${rnode} --rpc-user-agent ${rpcUserAgent}`;
		exec(`${rpccommand}`);
	}, 5000);
}
//  Launch app
App.launch();