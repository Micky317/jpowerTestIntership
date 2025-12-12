import { expect, test } from '@playwright/test';
import { openEstimateForClient, openEstimateOfTheClient, changeLead } from '@/utils/navigation/navigation';
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

test.describe.serial('Work Order - All tests in sequence', () => {

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

    test("Verify that the Client and Main/Billing Contact section can be filled", async () => {
        await page.waitForTimeout(1000);
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
        await page.fill("#name", "WorkOrder Test Client");
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
        }, 'Work Order test client - lorem ipsum dolor sit amet, consectetur adipiscing elit.');
        await page.click('#create');
        await page.waitForTimeout(5000);
    });

    test("Add property for the user", async () => {
        await page.getByText('WorkOrder Test Client', { exact: true }).click();
        await page.waitForTimeout(5000);
        await page.click("#Properties");
        await page.click("#new");
        const addressInput = page.locator('input[type="address"]').nth(0);
        await addressInput.waitFor({ state: 'visible' });
        const dynamicAddressId = await addressInput.getAttribute('id');
        await selectAddress(page, `#${dynamicAddressId}`);
        await selectZone(page, '#zoneId', 40);
        await page.fill('#route', '2000');
        await fillPropertyContactCard(page, '#contact', 1);
        await page.click('#addBillingContact');
        await fillPropertyBillingContact(page, 0, 2);
        await notesAndFiles(page);
        await page.click('#create');
        await page.waitForTimeout(5000);
    });

    test("Create a Work Order estimate with the data required", async () => {
        await openEstimateOfTheClient(page, 'WorkOrder Test Client');
        await page.waitForTimeout(5000);
        await page.click("#createEstimate");
        await page.click("#clientId");
        await page.fill("#clientId", "WorkOrder Test Client");
        await page.waitForTimeout(5000);
        await page.click("#type");
        await page.click("#type-Work_Order");
        await page.click('#propertyId');
        await page.getByTestId('propertyId-0').click();
        await page.waitForTimeout(5000);
        await page.click("#save");
        await page.waitForTimeout(5000);
    });

    

    test("Allow status change to 'Won' after uploading contract from modal", async () => {
        
        

        await page.waitForTimeout(3000);
        await page.click('#status');
        await page.click('#status-Won_Contract_Signed');
        const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
        await expect(warning).toBeVisible();
        await uploadFile(page, 'input[type="file"]');
        await page.waitForTimeout(2000);
        await page.click('#save');
        await page.waitForTimeout(1500);
        const currentStatus = await page.getAttribute('#status', 'value');
        expect(currentStatus).toBe('Won Contract Signed');
        await page.waitForTimeout(5000);
        await changeLead(page);
        await page.click('#save');
        await page.waitForTimeout(5000);
    });

        
    test("Verify file delete button removes file", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const filesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click('#files-0-delete');
    await page.waitForTimeout(2000);
    const filesAfter = await page.locator('tr[id^="row-"]').count();
    expect(filesAfter).toBeLessThan(filesBefore);
    await page.waitForTimeout(5000);
    });


    test("Verify contract upload in Files tab", async () => {
        
        await page.waitForTimeout(5000);
        await page.click('#Files');
        const filesBefore = await page.locator('tr[id^="row-"]').count();
        await uploadFile(page, '#addFile');
        await page.waitForTimeout(2000);
        const filesAfter = await page.locator('tr[id^="row-"]').count();
        expect(filesAfter).toBeGreaterThan(filesBefore);
        await page.waitForTimeout(5000);
    });

    test("Assign file type after contract upload", async () => {
        
        await page.waitForTimeout(5000);
        await page.click('#Files');
        await page.waitForTimeout(2000);
        await page.click('#files-0-type');
        await page.click('#files-0-type-Signed_Contract');
        await page.waitForTimeout(1000);
        const fileType = await page.getAttribute('#files-0-type', 'value');
        await page.click('#save');
        await page.waitForTimeout(2000);
        expect(fileType).toBe('Signed Contract');
        await page.waitForTimeout(5000);
    });

    test("Verify file view button opens preview", async () => {
        
        await page.waitForTimeout(5000);
        await page.click('#Files');
        await page.waitForTimeout(2000);
        const viewButton = page.locator('#row-0 button').first();
        await viewButton.click();
        const previewImage = page.locator('#dialog-body img[alt="image"]');
        await expect(previewImage).toBeVisible();
        await page.waitForTimeout(5000);
        await page.click('#close');
        await page.waitForTimeout(5000);
    });
    test("Verify that a new project with a dynamic ID is created", async () => {
        await page.waitForTimeout(5000);
        await page.click('#Details');

        const projectIds = await page.locator('tr[id^="project-"]').evaluateAll(rows =>
            rows.map(r => r.id)
        );

        const lastIndex = projectIds
            .map(id => parseInt(id.replace('project-', ''), 10))
            .reduce((a, b) => Math.max(a, b), -1);

        await page.click('#addProject');
        await page.waitForTimeout(2000);

        const newId = `project-${lastIndex + 1}`;
        const newRow = page.locator(`#${newId}`);
        await expect(newRow).toBeVisible();
    });
    
   async function createItem( typeId: string) {
  await page.click('#addItem');

  const typeLocator = page.locator(`#${typeId}`);
  try {
    await typeLocator.waitFor({ state: 'visible', timeout: 3000 });
  } catch {
    await page.click('#addItem');
    await typeLocator.waitFor({ state: 'visible', timeout: 5000 });
  }

  await typeLocator.click();
  switch (typeId) {
    case 'type-Equipment':
      await page.fill('#name', 'Test Equipment');
      await page.fill('#quantity', '5');
      await page.fill('#unitCost', '100');
      await page.fill('#margin', '10');
      break;

    case 'type-Fee':
      await page.fill('#name', 'Test Fee');
      await page.fill('#quantity', '2');
      await page.fill('#unitCost', '50');
      break;

    case 'type-Group':
      await page.fill('#name', 'Test Group');
      break;

    case 'type-Labor':
      await page.fill('#name', 'Test Labor');
      await page.fill('#quantity', '3');
      await page.fill('#margin', '15');
      break;

    case 'type-Material':
      await page.fill('#name', 'Test Material');
      await page.fill('#quantity', '10');
      await page.fill('#unitCost', '200');
      await page.fill('#margin', '20');
      await page.click('#unit');
      await page.click('#unit-TON');
      break;

    case 'type-Subcontractor':
      await page.fill('#name', 'Test Subcontractor');
      await page.fill('#quantity', '4');
      await page.fill('#unitCost', '300');
      await page.fill('#margin', '25');
      break;

    default:
      throw new Error(`Tipo no soportado: ${typeId}`);
  }
}



test("Create items in project-0 for all types", async () => {
  await page.waitForTimeout(5000);

  await page.click('#project-0');

  const itemTypes = [
    'type-Equipment',
    'type-Fee',
    'type-Labor',
    'type-Material',
    'type-Subcontractor',
    'type-Group'
  ];

  for (const typeId of itemTypes) {
    await createItem(typeId);
  }
  
  
  await page.waitForTimeout(4000);
  await page.click('#Details');
  await page.waitForTimeout(5000);
  await page.click('#project-0');
  await page.waitForTimeout(10000);
  await page.click('#save');
  await page.waitForTimeout(5000);
});



    test("Verify that a project is being copied", async ({ }) => {

        await page.click('#Details');
        const projectIds = await page.locator('tr[id^="project-"]').evaluateAll(rows =>
            rows.map(r => r.id)
        );
        const lastIndex = projectIds
            .map(id => parseInt(id.replace('project-', ''), 10))
            .reduce((a, b) => Math.max(a, b), -1);
        await page.click('#project-0');
        await page.click('#addProject-menu-toggle');
        const copyOption = page.locator('p[id^="copy2025WorkOrder"]').first();
        await expect(copyOption).toBeVisible();
        await copyOption.click();
        await page.waitForTimeout(2000);
        const newId = `project-${lastIndex + 1}`;
        const newRow = page.locator(`#${newId}`);
        await expect(newRow).toBeVisible();
    });







    test("Verify that when creating and deleting a project, the count is adjusted correctly", async () => {
        await page.waitForTimeout(5000);
        await page.click('#Details');
        await page.waitForTimeout(2000);
        const initialCount = await page.locator('tr[id^="row-"]').count();
        await page.click('#addProject');
        await page.waitForTimeout(3000);
        await page.click('#Details');
        await page.waitForTimeout(2000);
        const afterCreateCount = await page.locator('tr[id^="row-"]').count();
        expect(afterCreateCount).toBe(initialCount + 1);
        const newRowIndex = afterCreateCount - 1;
        const newRowId = `row-${newRowIndex}`;
        const newRow = page.locator(`#${newRowId}`);
        await expect(newRow).toBeVisible();
        const deleteButton = page.locator(`xpath=//*[@id="${newRowId}"]/td[10]/div/button`);
        await deleteButton.click({ force: true });
        await page.waitForTimeout(2000);
        await page.click('#Details');
        await page.waitForTimeout(2000);
        const afterDeleteCount = await page.locator('tr[id^="row-"]').count();
        expect(afterDeleteCount).toBe(initialCount);
    });




    test("Verify file download button opens image tab", async () => {
        
        await page.waitForTimeout(5000);
        await page.click('#Files');
        await page.waitForTimeout(2000);

        const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            page.click('#files-0-download'),
        ]);

        await newPage.waitForLoadState('domcontentloaded');
        const image = newPage.locator('img');
        await expect(image).toBeVisible();

        await newPage.close();
        await page.waitForTimeout(5000);
    });

    test("Edit contract date and ATTN fields", async () => {
        
        await page.waitForTimeout(5000);
        await page.click('#Contract');
        await page.waitForTimeout(1000);

        await page.fill('#contract-date', '2026-03-15');
        await page.waitForTimeout(500);
        await page.fill('#contract-attn', 'Attention: Project Manager');
        await page.waitForTimeout(500);

        await page.click('#save');
        await page.waitForTimeout(2000);

        const contractDate = await page.inputValue('#contract-date');
        const contractAttn = await page.inputValue('#contract-attn');
        expect(contractDate).toBe('2026-03-15');
        expect(contractAttn).toBe('Attention: Project Manager');
        await page.waitForTimeout(5000);
    });

    test("Edit and restore customer data in the estimate", async () => {
        function normalizeNumberString(value: string): string {
            return value.replace(/[^\d.-]/g, '');
        }
        
        await page.waitForTimeout(2000);
        await page.click('#Details');
        await page.waitForTimeout(2000);

        const textFieldIds = ['name', 'proposedDeal', 'reminderDate'];
        const originalTextValues = await storeFields(page, textFieldIds);

        const originalStatusValue = await page.inputValue('#status');
        const originalPaymentTermValue = await page.inputValue('#paymentTerm');
        const originalContactMethodValue = await page.inputValue('#contactMethod');

        const updatedTextValues: Record<string, string> = {
            name: 'Edited Work Order',
            proposedDeal: '75000',
            reminderDate: '2026-02-20',
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
        await page.waitForTimeout(1500);

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
        await page.waitForTimeout(1500);

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
        await openEstimateOfTheClient(page, 'WorkOrder Test Client',);
        await page.waitForTimeout(5000);
        await page.click('#Properties');
        await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
        await page.click('#delete');
        await page.click('#confirmDelete');
        const dialog = page.locator('#dialog-body');
        await expect(dialog).toBeVisible();
        const warning = dialog.getByText('This property cannot be deleted because it is linked', { exact: false });
        await expect(warning).toBeVisible();
        await page.click('#close');
    });

    test("Delete Work Order estimate", async () => {
        await openEstimateForClient(page, 'WorkOrder Test Client', 'Work Order');
        await page.waitForTimeout(5000);
        await page.click('#delete');

        const dialog = page.locator('#dialog-body');
        await expect(dialog).toBeVisible();

        const warning = dialog.getByText('Are you sure you want to delete this estimate?', { exact: false });
        await expect(warning).toBeVisible();

        await page.click('#confirmDelete');
        await page.waitForTimeout(3000);
        await page.click('#Estimates');
        const workOrderSection = page.getByText('Work Order', { exact: false });
        await expect(workOrderSection).toHaveCount(0);
    });

    test("Property Removal", async () => {
        await page.waitForTimeout(5000);
        await page.click('#Properties');
        await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
        await page.click('#delete');
        await page.click('#confirmDelete');

        await openEstimateOfTheClient(page, 'WorkOrder Test Client');
        await page.click('#Properties');
        const grid = page.locator('.ReactVirtualized__Grid__innerScrollContainer');
        await expect(grid.locator('[role="row"]')).toHaveCount(0);
    });

    test("Client removal", async () => {
        await page.click('#Profile');
        await page.waitForTimeout(5000);
        await page.click('#delete');
        await page.click('#confirmDelete');
        await page.waitForTimeout(5000);
        const clientName = page.getByText('WorkOrder Test Client', { exact: true });
        await expect(clientName).toHaveCount(0);
    });

});
