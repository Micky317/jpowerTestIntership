import { expect, Page } from "@playwright/test";
import { selectAddress } from "@/utils/input";
import { uploadFile } from ".";
import { add } from "lodash";

export const fillContactCard = async (page: Page, id: string, getValues?: boolean) => {
  const firstName = "first name";
  const lastName = "last name";
  const email = "test@email.com";
  const phone = "(111) 111-1111";
  const line2 = "line 2";
  const secondaryPhone = "(222) 222-2222";
  const address = "1106 Madison St, Oakland, CA 94607";
  const notes = "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

  if (!getValues) {
    await page.fill(`${id}-firstName`, firstName);
    await page.fill(`${id}-lastName`, lastName);
    await page.fill(`${id}-email`, email);
    await page.fill(`${id}-phone`, phone);
    await page.click(`${id}-phoneType`);
    await page.click(`${id}-phoneType-Mobile`);
    await page.fill(`${id}-secondaryPhone`, secondaryPhone);
    await page.click(`${id}-secondaryPhoneType`);
    await page.click(`${id}-secondaryPhoneType-Office`);
    
    const addressInput = page.locator('input[type="address"]').first();
    await addressInput.waitFor({ state: 'visible' });
    const dynamicAddressId = await addressInput.getAttribute('id');
    
    await selectAddress(page, `#${dynamicAddressId}`);
    await page.fill(`#${dynamicAddressId}-line2`, line2);
    
    await page.locator(`.ql-editor`).evaluate((el, text) => {
      el.innerHTML = `<p>${text}</p>`;
    }, notes);
    await uploadFile(page, `#addFile`);
  }

  return { address, firstName, lastName, email, phone, line2, secondaryPhone };
};

export const validateContactCard = async (
  page: Page,
  id: string,
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    line2: string;
    secondaryPhone: string;
    address: string;
  },
) => {
  await expect(page.locator(`${id}-firstName`)).toHaveValue(contact.firstName);
  await expect(page.locator(`${id}-lastName`)).toHaveValue(contact.lastName);
  await expect(page.locator(`${id}-email`)).toHaveValue(contact.email);
  await expect(page.locator(`${id}-phone`)).toHaveValue(contact.phone);
  
  
  const addressInput = page.locator('input[type="address"]').first();
  await addressInput.waitFor({ state: 'visible' });
  const dynamicAddressId = await addressInput.getAttribute('id');
  
  await expect(page.locator(`#${dynamicAddressId}`)).toHaveValue(contact.address);
  await expect(page.locator(`#${dynamicAddressId}-line2`)).toHaveValue(contact.line2);
  
  await expect(page.locator(`${id}-secondaryPhone`)).toHaveValue(contact.secondaryPhone);
};
export const fillPropertyContactCard = async (page: Page, id: string, addressIndex: number = 0) => {
  const firstName = "property first name";
  const lastName = "property last name";
  const email = "test@exmaple.com";
  const phone = "(333) 333-3333";
  const line2 = "line 2";
  const address = "500 Terry A Francois Blvd, San Francisco, CA 94158";

  await page.fill(`${id}-firstName`, firstName);
  await page.fill(`${id}-lastName`, lastName);
  await page.fill(`${id}-email`, email);
  await page.fill(`${id}-phone`, phone);
  

  const addressInput = page.locator('input[type="address"]').nth(addressIndex);
  await addressInput.waitFor({ state: 'visible' });
  const dynamicAddressId = await addressInput.getAttribute('id');
    
  await selectAddress(page, `#${dynamicAddressId}`);
  await page.fill(`#${dynamicAddressId}-line2`, line2);
}
export const fillPropertyBillingContact = async (page: Page, contactIndex: number = 0, addressIndex: number = 0) => {
  const firstName = "billing first name";
  const lastName = "billing last name";
  const email = "billing@example.com";
  const phone = "(444) 444-4444";
  const line2 = "line 2";

  const id = `#billingContacts-${contactIndex}`;

  await page.fill(`${id}-firstName`, firstName);
  await page.fill(`${id}-lastName`, lastName);
  await page.fill(`${id}-email`, email);
  await page.fill(`${id}-phone`, phone);
  
  const addressInput = page.locator('input[type="address"]').nth(addressIndex);
  await addressInput.waitFor({ state: 'visible' });
  const dynamicAddressId = await addressInput.getAttribute('id');
    
  await selectAddress(page, `#${dynamicAddressId}`);
  await page.fill(`#${dynamicAddressId}-line2`, line2);

  return { firstName, lastName, email, phone, address: "1106 Madison St, Oakland, CA 94607", line2 };
};
