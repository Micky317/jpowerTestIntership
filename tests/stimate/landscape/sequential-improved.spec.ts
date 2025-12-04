import { expect, test } from '@playwright/test';
import { openEstimateForClient, openEstimateOfTheClient, changeLead, openPropertiesInTheClients } from '@/utils/navigation/navigation';
import fs from 'fs';
import { notesAndFiles, selectAddress } from '@/utils/input';
import path from 'path';
import { fillContactCard, fillPropertyContactCard, validateContactCard, fillPropertyBillingContact } from '@/utils/contact';
import { signIn, uploadFile } from '@/utils';
import { clientTimeout, openClientsTable } from '@/utils/data/client';
import { addRoleToUser } from '@/utils/data/user';
import { selectOption, toggleCheckbox, fillDate, storeFields, restoreFields } from '@/utils/input';
import { openCreatePage, searchTable } from '@/utils/table';
import { selectZone } from '@/utils/data/zone';
import { fillMapProperty, fillSalesProperty, openPropertiesTable } from '@/utils/data/property';
import { Page } from '@playwright/test';
import { TEST_CONSTANTS, TEST_SERVICES, LOREM_IPSUM } from './constants';
import { normalizeNumberString, navigateToTab, waitForRowCount, waitForSaveComplete } from './helpers';

test.describe.serial('All tests in sequence (Improved)', () => {

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        page = await context.newPage();

        test.setTimeout(clientTimeout);
        await signIn(page);
        await openClientsTable(page);
    });

    test.afterAll(async () => {
        await page.close();
    });



    test("Verify that the Client and Main/ Billing Contact section can be filled", async () => {

        await page.waitForSelector('#search', { state: 'visible' });
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForSelector('#name', { state: 'visible', timeout: 10000 });
        await page.fill("#name", TEST_CONSTANTS.CLIENT_NAME);
        await page.click('#priority');
        await page.click('#priority-High');
        await page.click('#salesRepId');
        await page.getByTestId('salesRepId-0').click();
        await page.click('#accountManagerId');
        await page.getByTestId('accountManagerId-0').click();
        const billingContactData = await fillContactCard(page, '#billingContact');
        await validateContactCard(page, '#billingContact', billingContactData);
        await page.locator('.ql-editor').evaluate((el, text) => {
            el.innerHTML = `<p>${text}</p>`;
        }, LOREM_IPSUM);
        await page.click('#create');
        await page.waitForURL('**/client/**', { timeout: 10000 });
    });



    test("add property for the user", async () => {
        await page.getByText(TEST_CONSTANTS.CLIENT_NAME, { exact: true }).click();
        await page.waitForSelector('#Properties', { state: 'visible', timeout: 10000 });
        await navigateToTab(page, 'Properties');
        await page.click("#new");
        const addressInput = page.locator('input[type="address"]').nth(0);
        await addressInput.waitFor({ state: 'visible' });
        const dynamicAddressId = await addressInput.getAttribute('id');
        await selectAddress(page, `#${dynamicAddressId}`);
        await selectZone(page, '#zoneId', TEST_CONSTANTS.DEFAULT_ZONE_INDEX);
        await page.fill('#route', TEST_CONSTANTS.ROUTE_NUMBER);
        await fillPropertyContactCard(page, '#contact', 1);
        await page.click('#addBillingContact');
        await fillPropertyBillingContact(page, 0, 2);
        await notesAndFiles(page);
        await page.click('#create');
        await page.waitForURL('**/property/**', { timeout: 10000 });
    });




    test("create an estimate with the data required to do this", async () => {

        await openEstimateOfTheClient(page, TEST_CONSTANTS.CLIENT_NAME);
        await page.waitForSelector('#createEstimate', { state: 'visible', timeout: 10000 });
        await page.click("#createEstimate");
        await page.click("#clientId");
        await page.fill("#clientId", TEST_CONSTANTS.CLIENT_NAME);
        await page.waitForSelector('[data-testid="clientId-0"]', { state: 'visible', timeout: 10000 });
        await page.getByTestId('clientId-0').click();
        await page.click("#type");
        await page.click("#type-Landscape_Maintenance");
        await page.click("#contactName");
        await page.fill("#contactName", "first name last name");
        await page.waitForTimeout(1000);
        await page.click("#save");
        await page.waitForURL('**/estimate/**', { timeout: 10000 });
    });



    test("Add to properties in the estimate", async () => {
        await page.waitForSelector('#Properties', { state: 'visible', timeout: 10000 });
        await navigateToTab(page, 'Properties');
        const propertiesBefore = await page.locator('tr[id^="row-"]').count();
        await page.click("#addProperty");
        await page.waitForTimeout(500);
        await selectZone(page, '#propertyId', TEST_CONSTANTS.DEFAULT_ZONE_INDEX);
        await fillMapProperty(page, '#map');
        await uploadFile(page, `#map-files`); //If the property already has an image loaded, do not load another one; if it doesn't, then load it.
        await fillSalesProperty(page, '#sales');
        await page.click(`#sales-isAeration`);
        await page.click("#save");
        const newRow = `#row-${propertiesBefore}`;
        await page.waitForSelector(newRow, { state: 'attached', timeout: 7000 });
        await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore + 1);
        await waitForSaveComplete(page);
    });



    test("Prevent changing estimate status to Won without signed contract", async () => {

        await page.waitForSelector('#status', { state: 'visible', timeout: 5000 });

        await page.click('#status');
        await page.click('#status-Won_Contract_Signed');

        const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
        await expect(warning).toBeVisible();
        await page.click('#close');
        const currentStatus = await page.locator('#status').innerText();
        expect(currentStatus).not.toContain('Won');

    });

    test("Allow status change to 'Won' after uploading contract from modal", async () => {


        await page.waitForSelector('#status', { state: 'visible', timeout: 5000 });
        await page.click('#status');
        await page.click('#status-Won_Contract_Signed');
        const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
        await expect(warning).toBeVisible();
        await uploadFile(page, 'input[type="file"]');
        await page.waitForTimeout(1000);
        await page.click('#save');
        await page.waitForTimeout(1000);
        const currentStatus = await page.getAttribute('#status', 'value');
        expect(currentStatus).toBe('Won Contract Signed');
        await waitForSaveComplete(page);
        await changeLead(page);
    });

    test("Verify file delete button removes file", async () => {
        await navigateToTab(page, 'Files');
        const filesBefore = await page.locator('tr[id^="row-"]').count();
        await page.click('#files-0-delete');
        await page.waitForTimeout(1000);
        const filesAfter = await page.locator('tr[id^="row-"]').count();
        expect(filesAfter).toBeLessThan(filesBefore);
        await waitForSaveComplete(page);
    });

    test("Verify contract upload in Files tab", async () => {

        await navigateToTab(page, 'Files');
        const filesBefore = await page.locator('tr[id^="row-"]').count();
        await uploadFile(page, '#addFile');
        await page.waitForTimeout(1000);
        const filesAfter = await page.locator('tr[id^="row-"]').count();
        expect(filesAfter).toBeGreaterThan(filesBefore);
        await waitForSaveComplete(page);
        await page.click('#save');
        await waitForSaveComplete(page);
    });

    test("Assign file type after contract upload", async () => {

        await navigateToTab(page, 'Files');
        await page.click('#files-0-type');
        await page.click('#files-0-type-Signed_Contract');
        await page.waitForTimeout(500);
        const fileType = await page.getAttribute('#files-0-type', 'value');
        await page.click('#save');
        await waitForSaveComplete(page);
        expect(fileType).toBe('Signed Contract');
    });

    test("Verify file view button opens preview", async () => {

        await navigateToTab(page, 'Files');
        const viewButton = page.locator('#row-0 button').first();
        await viewButton.click();
        const previewImage = page.locator('#dialog-body img[alt="image"]');
        await expect(previewImage).toBeVisible();
        await page.waitForTimeout(1000);
        await page.click('#close');
        await page.waitForTimeout(500);
    });

    test("Verify file download button opens image tab", async () => {
        await navigateToTab(page, 'Files');

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            page.click('#files-0-download'),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const image = newPage.locator('img');
        await expect(image).toBeVisible();

        await newPage.close();

        await page.waitForTimeout(1000);
    });







    test("Edit contract start and end dates", async () => {

        await navigateToTab(page, 'Contract');
        await page.fill('#contract-startDate', TEST_CONSTANTS.CONTRACT_START_DATE);
        await page.waitForTimeout(300);
        await page.fill('#contract-endDate', TEST_CONSTANTS.CONTRACT_END_DATE);
        await page.waitForTimeout(300);
        await page.click('#save');
        await waitForSaveComplete(page);
        const startDate = await page.inputValue('#contract-startDate');
        const endDate = await page.inputValue('#contract-endDate');
        expect(startDate).toBe(TEST_CONSTANTS.CONTRACT_START_DATE);
        expect(endDate).toBe(TEST_CONSTANTS.CONTRACT_END_DATE);
    });

    test("Show error when start date is after end date", async () => {
        await navigateToTab(page, 'Contract');

        const originalValues = await storeFields(page, [
            'contract-startDate',
            'contract-endDate'
        ]);
        try {
            await page.fill('#contract-startDate', TEST_CONSTANTS.INVALID_START_DATE);
            await page.waitForTimeout(300);
            await page.fill('#contract-endDate', TEST_CONSTANTS.INVALID_END_DATE);
            await page.waitForTimeout(300);
            await page.click('#save');
            await page.waitForTimeout(500);
            const errorMessage = page.locator('text=Contract end date cannot be before start date');
            await expect(errorMessage).toBeVisible();
        } finally {
            await restoreFields(page, originalValues);
        }
    });



    test("Edit and save contract fields with verification", async () => {
        await navigateToTab(page, 'Contract');
        const updatedValues: Record<string, string> = {
            'contract-address': TEST_CONSTANTS.UPDATED_CONTRACT_ADDRESS,
            'contract-attn': TEST_CONSTANTS.UPDATED_CONTRACT_ATTN,
            'contract-date': TEST_CONSTANTS.UPDATED_CONTRACT_DATE,
            'contract-title': TEST_CONSTANTS.UPDATED_CONTRACT_TITLE,
        };
        for (const [id, value] of Object.entries(updatedValues)) {
            await page.fill(`#${id}`, value);
        }
        await page.click('#save');
        await waitForSaveComplete(page);
        for (const [id, expected] of Object.entries(updatedValues)) {
            const actual = await page.inputValue(`#${id}`);
            expect(actual).toBe(expected);
        }
    });


    test("Verify that multiple services can be added and saved", async () => {
        await navigateToTab(page, 'Services');
        const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
        const initialCount = await serviceInputs.count();
        for (let i = 0; i < TEST_SERVICES.length; i++) {
            await page.click('#addService');
            await page.waitForTimeout(500);
            const serviceIndex = initialCount + i;
            await page.fill(`#services-${serviceIndex}-name`, TEST_SERVICES[i]);
            await page.waitForTimeout(300);
        }
        await page.click('#save');
        await waitForSaveComplete(page);
        const updatedServiceInputs = page.locator('input[id^="services-"][id$="-name"]');
        const finalCount = await updatedServiceInputs.count();
        expect(finalCount).toBe(initialCount + TEST_SERVICES.length);
        const savedValues: string[] = [];
        for (let i = 0; i < finalCount; i++) {
            const value = await page.inputValue(`#services-${i}-name`);
            savedValues.push(value);
        }
        for (const serviceName of TEST_SERVICES) {
            expect(savedValues).toContain(serviceName);
        }
    });

    test("Verify error message when adding service without name", async () => {

        await navigateToTab(page, 'Services');
        const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
        const currentCount = await serviceInputs.count();
        await page.click('#addService');
        await page.waitForTimeout(500);
        await page.click('#save');
        await page.waitForTimeout(1000);
        const expectedErrorMessage = `Services: ${currentCount + 1}: Name Required`;
        const errorMessage = page.locator(`text=${expectedErrorMessage}`);
        await expect(errorMessage).toBeVisible();
    });

    test("Verify that delete button removes a service", async () => {

        await navigateToTab(page, 'Services');

        const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
        const initialCount = await serviceInputs.count();
        if (initialCount === 0) {
            throw new Error('No services available to delete');
        }
        const serviceToDelete = await page.inputValue('#services-0-name');

        // Use a more robust selector instead of fragile XPath
        const deleteButton = page.locator('#services-0').locator('button').first();

        await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
        await deleteButton.click({ noWaitAfter: true });
        await page.waitForTimeout(1000);
        const updatedCount = await serviceInputs.count();
        await page.click('#save');
        await waitForSaveComplete(page);
        const finalCount = await serviceInputs.count();
        expect(finalCount).toBe(initialCount - 1);
        const savedValues: string[] = [];
        for (let i = 0; i < finalCount; i++) {
            const value = await page.inputValue(`#services-${i}-name`);
            savedValues.push(value);
        }
        expect(savedValues).not.toContain(serviceToDelete);
    });




    test("Toggle 'Hide Contract Summary' and verify visibility", async () => {

        await navigateToTab(page, 'Contract');

        const checkbox = page.locator('#contract-hideContractSummary');
        const section = page.locator('#contract-summary');

        await expect(section).toBeVisible();
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(section).toHaveCount(0);
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(section).toBeVisible();
    });

    test("Toggle 'Hide Optional Services' and verify header is not visible", async () => {
        await navigateToTab(page, 'Contract');

        const contractContainer = page.locator('div.overflow-x-auto');
        const checkbox = contractContainer.locator('#contract-hideOptionalServices');

        const sectionHeader = contractContainer.locator(
            'p.absolute.font-bold.text-center',
            { hasText: 'OPTIONAL SERVICES' }
        );

        await expect(sectionHeader).toBeVisible();
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(sectionHeader).not.toBeVisible();
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(sectionHeader).toBeVisible();
    });

    test("Toggle 'Hide Property Breakdown' and verify section disappears", async () => {
        await navigateToTab(page, 'Contract');

        const contractContainer = page.locator('div.overflow-x-auto');
        const checkbox = contractContainer.locator('#contract-hidePropertyBreakdown');

        const breakdownSection = contractContainer.locator('div.relative.h-5.mb-4');

        await expect(breakdownSection).toBeVisible();
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(breakdownSection).not.toBeVisible();
        await checkbox.click();
        await page.waitForTimeout(500);
        await expect(breakdownSection).toBeVisible();
    });





    test("Edit and restore customer data in the estimate", async () => {

        await page.waitForTimeout(1000);
        await navigateToTab(page, 'Details');

        const textFieldIds = ['name', 'proposedDeal', 'reminderDate'];
        const originalTextValues = await storeFields(page, textFieldIds);

        const originalStatusValue = await page.inputValue('#status');
        const originalPaymentTermValue = await page.inputValue('#paymentTerm');
        const originalContactMethodValue = await page.inputValue('#contactMethod');

        const updatedTextValues: Record<string, string> = {
            name: 'Edited Walmart',
            proposedDeal: '1000000',
            reminderDate: '2025-11-07',
        };

        const updatedStatusId = 'Data_Gathering';
        const updatedPaymentTermId = 'Upon_Completion';
        const updatedContactMethodId = 'Email';

        await page.fill('#name', updatedTextValues.name);
        await page.fill('#proposedDeal', updatedTextValues.proposedDeal);
        await page.fill('#reminderDate', updatedTextValues.reminderDate);

        await page.click('#status');
        await page.click(`#status-${updatedStatusId}`);

        await page.click('#paymentTerm');
        await page.click(`#paymentTerm-${updatedPaymentTermId}`);

        await page.click('#contactMethod');
        await page.click(`#contactMethod-${updatedContactMethodId}`);

        await page.click('#save');
        await page.waitForTimeout(1000);

        for (const [id, expected] of Object.entries(updatedTextValues)) {
            const actual = await page.inputValue(`#${id}`);
            if (id === 'proposedDeal') {
                expect(normalizeNumberString(actual)).toBe(normalizeNumberString(expected));
            } else {
                expect(actual).toBe(expected);
            }
        }

        expect(await page.inputValue('#status')).toBe('Data Gathering');
        expect(await page.inputValue('#paymentTerm')).toBe('Upon Completion');
        expect(await page.inputValue('#contactMethod')).toBe('Email');

        await restoreFields(page, originalTextValues);

        if (originalStatusValue && originalStatusValue.trim() !== '') {
            await page.click('#status');
            await page.click(`#status-${originalStatusValue.replace(/\s/g, '_')}`);
        }

        if (originalPaymentTermValue && originalPaymentTermValue.trim() !== '') {
            await page.click('#paymentTerm');
            await page.click(`#paymentTerm-${originalPaymentTermValue.replace(/\s/g, '_')}`);
        }

        if (originalContactMethodValue && originalContactMethodValue.trim() !== '') {
            await page.click('#contactMethod');
            await page.click(`#contactMethod-${originalContactMethodValue}`);
        }

        await page.click('#save');
        await page.waitForTimeout(1000);

        for (const [id, expected] of Object.entries(originalTextValues)) {
            const actual = await page.inputValue(`#${id}`);
            if (id === 'proposedDeal') {
                expect(normalizeNumberString(actual)).toBe(normalizeNumberString(expected));
            } else {
                expect(actual).toBe(expected);
            }
        }

        const restoredStatusValue = await page.inputValue('#status');
        expect(restoredStatusValue).toBe(originalStatusValue);
    });



    test("Cannot delete a property if it is linked to one or more estimates and the proper warning message is shown", async () => {
        await openEstimateOfTheClient(page, TEST_CONSTANTS.CLIENT_NAME);
        await page.waitForSelector('#Properties', { state: 'visible', timeout: 10000 });
        await navigateToTab(page, 'Properties');
        await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
        await page.click('#delete');
        await page.click('#confirmDelete');
        const dialog = page.locator('#dialog-body');
        await expect(dialog).toBeVisible();
        const warning = dialog.getByText('This property cannot be deleted because it is linked', { exact: false });
        await expect(warning).toBeVisible();
        await page.click('#close');
    });

    test("Delete property in the estimate", async () => {
        await page.waitForTimeout(1000);
        await openEstimateForClient(page, TEST_CONSTANTS.CLIENT_NAME, 'Landscape Maintenance');
        await navigateToTab(page, 'Details');
        await page.waitForSelector('#Properties', { state: 'visible', timeout: 10000 });
        await navigateToTab(page, 'Properties');
        const propertiesBefore = await page.locator('tr[id^="row-"]').count();
        await page.click("#row-0");
        await page.click("#delete");
        await page.waitForSelector('#row-0', { state: 'detached', timeout: 7000 });
        await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore - 1);
        await page.click('#save');
        await waitForSaveComplete(page);
    });



    test("Delete service in the estimate", async () => {
        await page.waitForTimeout(1000);
        await page.click('#delete');

        const dialog = page.locator('#dialog-body');
        await expect(dialog).toBeVisible();

        const warning = dialog.getByText('Are you sure you want to delete this estimate?', { exact: false });
        await expect(warning).toBeVisible();

        await page.click('#confirmDelete');
        await page.waitForTimeout(2000);
        const landscapeSection = page.getByText('Landscape Maintenance', { exact: false });
        await expect(landscapeSection).toHaveCount(0);
    });

    test("Property Removal", async () => {
        await page.waitForTimeout(1000);
        await navigateToTab(page, 'Properties');
        await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
        await page.click('#delete');
        await page.click('#confirmDelete');

        await openEstimateOfTheClient(page, TEST_CONSTANTS.CLIENT_NAME);
        await navigateToTab(page, 'Properties');
        const grid = page.locator('.ReactVirtualized__Grid__innerScrollContainer');
        await expect(grid.locator('[role="row"]')).toHaveCount(0);
    });

    test("Client removal", async () => {
        await page.click('#Profile')
        await page.waitForTimeout(1000);
        await page.click('#delete');
        await page.click('#confirmDelete');
        await page.waitForTimeout(2000);
        const clientName = page.getByText(TEST_CONSTANTS.CLIENT_NAME, { exact: true });
        await expect(clientName).toHaveCount(0);
    });

});
