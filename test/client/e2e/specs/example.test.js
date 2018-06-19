import { getBaseUrl } from '../utils';
import Page from '../pageObjects/Page';

const page = new Page();


fixture(`Home page`)
    .page( getBaseUrl() );

    // Create a new test(description, function(testController): <Promise>)
    test('Footer links are correct', async t => {
        // Select the paragraph element under the body.
        // Must use promises (async / await  here) for communication with the browser.
        // const paragraphSelector = await new Selector('body > p');

        // Assert that the inner text of the paragraph is "Hello World!"
        await t.expect(page.footer.linkContactUs.innerText).eql('Contact Us!');
        await t.expect(page.footer.linkPrivacy.innerText).eql('Privacy');
        await t.expect(page.footer.linkConditions.innerText).eql('Conditions of Use');
    });
