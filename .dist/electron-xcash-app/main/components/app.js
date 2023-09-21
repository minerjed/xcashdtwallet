import { app, shell } from 'electron';
import { Window } from './window';
export class App {
    static launch() {
        app.on('window-all-closed', App.quit);
        app.on('activate', App.start);
        app.on('ready', App.start);
        // Limit navigation and open external links in default browser
        app.on('web-contents-created', App.openExternalLinksInDefaultBrowser);
    }
    static get electronWindow() {
        return this._wrapper ? this._wrapper.electronWindow : undefined;
    }
    static start() {
        // On MacOS it is common to re-create a window from app even after all windows have been closed
        if (!App.electronWindow) {
            App._wrapper = new Window();
        }
    }
    static quit() {
        // On MacOS it is common for applications to stay open until the user explicitly quits
        // But WebDriverIO Test Runner does handle that behaviour yet
        if (process.platform !== 'darwin' ||
            global.appConfig.configId === 'e2e-test') {
            app.quit();
        }
    }
}
App.openExternalLinksInDefaultBrowser = (event, contents) => {
    // Disabling creation of new windows
    contents.setWindowOpenHandler((handler) => {
        // Telling the user platform to open this event's url in the default browser
        shell.openExternal(handler.url);
        // Blocking this event from loading in current app
        return { action: 'deny' };
    });
    // Limiting navigation
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        // Allowing local navigation only
        if (parsedUrl.origin !== 'http://localhost:4200') {
            event.preventDefault();
        }
    });
};
//# sourceMappingURL=app.js.map