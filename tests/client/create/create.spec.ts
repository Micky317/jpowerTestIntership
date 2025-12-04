import {expect, test} from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {signIn, uploadFile} from '@/utils';
import {fillContactCard, validateContactCard} from '@/utils/contact';
import {clientTimeout, openClientsTable} from '@/utils/data/client';
import {addRoleToUser} from '@/utils/data/user';
import {selectOption, toggleCheckbox} from '@/utils/input';
import {openCreatePage} from '@/utils/table';

test.beforeEach(async ({page}) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);

});

test("create client with all fields filled", async ({page}) => {
  await page.waitForTimeout(5000);
  await page.click('#name')
  await page.fill('#name', 'walmart');
  await page.fill('#billingContact-firstName', 'john');
  
});