import { WindowApi } from './apis/window-api';
import { WindowElectronFs } from './apis/window-electronFs';
import { WindowElectronAPIs } from './apis/window-electronAPIs';
export * from './apis/window-api';
export * from './apis/window-api-consts';
export * from './models/config/app-config';

declare global {
	// Global augmentation of the `Window` interface
	interface Window {
		api: WindowApi;
		electronFs: WindowElectronFs;
		electronAPIs: WindowElectronAPIs;
	}
}