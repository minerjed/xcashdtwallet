var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import AbstractPage from './page';
class MultiplesPage extends AbstractPage {
    /**
     * Selectors using getter methods
     */
    get root() {
        return $('#multiples');
    }
    get input() {
        return $('#input');
    }
    get results() {
        return $$('.results');
    }
    get buttonSubmit() {
        return $('button[type="submit"]');
    }
    /**
     * Wrapper method to interact with the page
     */
    enterInput(number) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.input.setValue(number);
            yield this.buttonSubmit.click();
        });
    }
}
export default new MultiplesPage();
//# sourceMappingURL=multiples.page.js.map