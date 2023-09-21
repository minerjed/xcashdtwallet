/*import MainPage from  './pageobjects/main.page';

describe('My Login application', () => {
    it('should login with valid credentials', async () => {
        await MainPage.open();
        /*await LoginPage.open();

        await LoginPage.login('tomsmith', 'SuperSecretPassword!');
        await expect(SecurePage.flashAlert).toBeExisting();
        await expect(SecurePage.flashAlert).toHaveTextContaining(
            'You logged into a secure area!');* /
    });
});* /

describe('application loading', () => {
    describe('App', () => {
        it('should launch the application', async () => {
            
            console.log('==>', await browser.getTitle());
            // expect(title).toEqual('Test');
        });

        // it('should pass args through to the launched application', async () => {
        //   // custom args are set in the wdio.conf.js file as they need to be set before WDIO starts
        //   const argv = await app.mainProcess.argv();
        //   expect(argv).toContain('--foo');
        //   expect(argv).toContain('--bar=baz');
        // });
    });
}); */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
describe('A simple test to check if app window is opened, visible and with expected title', () => {
    describe('App should', () => {
        it('show an initial window', () => __awaiter(this, void 0, void 0, function* () {
            // Checking there is one visible window
            // expect(await browser.).toEqual(true);
            // Please note that getWindowHandles() will return 2 if `dev tools` is opened.
            const { length } = yield browser.getWindowHandles();
            expect(length).toEqual(1);
        }));
        it('have expected title', () => __awaiter(this, void 0, void 0, function* () {
            expect(yield browser.getTitle()).toEqual('ElectronAngularQuickStart');
        }));
    });
});
//# sourceMappingURL=app.spec.js.map