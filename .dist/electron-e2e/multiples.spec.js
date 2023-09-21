var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import MultiplesPage from './pageobjects/multiples.page';
describe('A simple test to check if a given input matches with computed multiples', () => {
    describe('Multiples component should', () => {
        it('show up on startup', () => __awaiter(void 0, void 0, void 0, function* () {
            yield expect(MultiplesPage.root).toBeDisplayed();
        }));
        const number = Math.floor(Math.random() * 100) % 10;
        it(`display expected results on input (${number})`, () => __awaiter(void 0, void 0, void 0, function* () {
            yield MultiplesPage.enterInput(number);
            const results = yield MultiplesPage.results;
            for (const index of results.keys()) {
                const ntimes = 1 + index;
                const expected = `${number} * ${ntimes} = ${number * ntimes}`;
                expect(yield results[index].getText()).toEqual(expected);
            }
        }));
    });
});
//# sourceMappingURL=multiples.spec.js.map