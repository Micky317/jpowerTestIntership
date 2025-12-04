import { expect, test } from "@playwright/test";
import { signIn, uploadFile } from "@/utils";
import { fillContactCard, validateContactCard } from "@/utils/contact";
import { addRoleToUser } from "@/utils/data/user";
import { openVendorsTable, vendorTimeout } from "@/utils/data/vendor";
import { selectOption, toggleCheckbox } from "@/utils/input";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(vendorTimeout);
  await signIn(page);
  await openVendorsTable(page);
  await openCreatePage(page);
});

test("verify that a vendor cannot be created if all required fields are not completed: Name", async ({
  page,
}) => {
  await page.click("#save");
  await expect(page.getByText("Name Required")).toBeVisible();
});

test("verify that the vendor's name is displayed at the top left of the Profile section: 'Vendors / [name]'", async ({
  page,
}) => {
  await page.fill("#name", "test");
  await expect(page.locator("#breadcrumb-1")).toHaveText("test");
});

test("verify that the Zone Manager field displays options (if any) and an option can be selected", async ({
  page,
}) => {
  await addRoleToUser(page, "Zone Manager");
  await selectOption(page, "#zoneManagerId");
});

test("Verify that Vendor checkbox is selected", async ({ page }) => {
  await expect(page.locator("#isVendor")).toBeChecked();
});

test("Verify External Id field doesn't allow manual entry", async ({ page }) => {
  await expect(page.locator("#externalId")).toHaveAttribute("disabled");
});

test("Verify that the Search button is on the right side of the External Id field and when you click on it, a window opens with the email field and the search and Cancel buttons", async ({
  page,
}) => {
  await page.waitForURL("**/vendor/new");
  await page.click("#search");
  await expect(page.locator("#dialog #email")).toBeVisible();
  await expect(page.locator("#dialog #search")).toBeVisible();
  await expect(page.locator("#dialog #cancel")).toBeVisible();
  await page.click("#dialog #cancel");
});

test("Verify entering an existing email, options will be displayed → verify that an option can be selected and the id will be filled in the external ID field", async ({
  page,
}) => {
  await page.waitForURL("**/vendor/new");
  await page.click("#search");
  await page.fill("#dialog #email", String(process.env.EMAIL));
  await page.click("#dialog #search");
  await page.click("#organization-0");
  await expect(page.locator("#externalId")).not.toBeEmpty();
});

test("Verify Notes can be filled", async ({ page }) => {
  await page.fill("#notes", "Test");
  await expect(page.locator("#notes")).toHaveValue("Test");
});

test("Verify that Client and Vendor options can be selected and deselected", async ({ page }) => {
  await toggleCheckbox(page, "#isClient");
  await toggleCheckbox(page, "#isVendor");
});

test("If QB is integrated, verify that within Profile section, QuickBooks Vendor field is displayed and an option can be selected", async ({
  page,
}) => {
  await selectOption(page, "#quickBooksVendorId");
});

test("Verify Compliance section is displayed: Certificate of Insurance, Master Agreement, W-9 checkboxes", async ({
  page,
}) => {
  await page.click("#certificateOfInsurance");
  await page.click("#masterAgreement");
  await page.click("#w9");
});

test("Verify that the Billing Contact section is displayed with the following fields: First Name, Last Name, Email, Phone, Address, Secondary Address", async ({
  page,
}) => {
  await fillContactCard(page, "#billingContact");
});

test.describe("Verify that the Billing Contact section can be filled", () => {
  test("Verify Billing Contact field can be updated clicking on the pencil", async ({ page }) => {
    await page.click("#billingContact-editTitle");
    await page.fill("#billingContact-title", "test");
  });

  test("Verify that the email is filled with valid format: [test]@[gmail].[com]", async ({
    page,
  }) => {
    await fillContactCard(page, "#billingContact");
  });

  test("Verify that the inserted address can be selected from the options displayed in the Google drop-down list", async ({
    page,
  }) => {
    await fillContactCard(page, "#billingContact");
  });

  test("Verify that the phone/secondary phone are filled with valid information: no letters, except '+'", async ({
    page,
  }) => {
    const contact = await fillContactCard(page, "#billingContact");
    await validateContactCard(page, "#billingContact", contact);
  });
});

test("Verify that the 'Add Contact' button is available at the top right in the Billing Contact section", async ({
  page,
}) => {
  await expect(page.locator("#addContact")).toBeVisible();
});

test.describe("Verify that the Contact section can be filled", () => {
  test.beforeEach(async ({ page }) => {
    await page.click("#addContact");
  });

  test("Verify Contact field can be updated clicking on the pencil", async ({ page }) => {
    await page.click("#contacts-0-editTitle");
    await page.fill("#contacts-0-title", "test");
  });

  test("Verify that the email is filled with valid format: [test]@[gmail].[com]", async ({
    page,
  }) => {
    await fillContactCard(page, "#contacts-0");
  });

  test("Verify that the inserted address can be selected from the options displayed in the Google drop-down list", async ({
    page,
  }) => {
    await fillContactCard(page, "#contacts-0");
  });

  test("Verify that the phone/secondary phone are filled with valid information: no letters, except '+'", async ({
    page,
  }) => {
    const contact = await fillContactCard(page, "#contacts-0");
    await validateContactCard(page, "#contacts-0", contact);
  });
});

test.describe("Verify at least one file can be uploaded", () => {
  test("Verify that the Type field displays options: Certificate of Insurance, Master Agreement, W-9", async ({
    page,
  }) => {
    await uploadFile(page, "#addFile");
    await page.click("#files-0-type");
    await expect(page.locator("#files-0-type-Certificate_of_Insurance")).toBeVisible();
    await expect(page.locator("#files-0-type-Master_Agreement")).toBeVisible();
    await expect(page.locator("#files-0-type-W_9")).toBeVisible();
  });

  test("Verify that the Certificate of Insurance after selected, Start Date and End Date fields are displayed → Verify dates are required", async ({
    page,
  }) => {
    await page.fill("#name", "test");
    await uploadFile(page, "#addFile");
    await page.click("#files-0-type");
    await page.click("#files-0-type-Certificate_of_Insurance");
    await page.click("#save");
    await expect(page.locator("#error")).toHaveText(
      "Certificate of Insurance start and end date required",
    );
  });

  test("Verify after filling the items for the different types, the compliance checkboxes are checked", async ({
    page,
  }) => {
    await uploadFile(page, "#addFile");
    await page.click("#files-0-type");
    await page.click("#files-0-type-Certificate_of_Insurance");
    await page.fill("#files-0-startDate", "2020-01-01");
    await page.fill("#files-0-endDate", "2030-01-01");
    await expect(page.locator("#certificateOfInsurance")).toBeChecked();

    await uploadFile(page, "#addFile");
    await page.click("#files-1-type");
    await page.click("#files-1-type-Master_Agreement");
    await expect(page.locator("#masterAgreement")).toBeChecked();

    await uploadFile(page, "#addFile");
    await page.click("#files-2-type");
    await page.click("#files-2-type-W_9");
    await expect(page.locator("#w9")).toBeChecked();
  });
});

test("Verify File card can be expanded and contracted", async ({ page }) => {
  const fileName = await uploadFile(page, "#addFile");
  await expect(page.getByText(fileName)).toBeVisible();
  await page.click("#files-close");
  await expect(page.getByText(fileName)).not.toBeVisible();
});

test("Verify a profile photo can be uploaded and displayed in the profile picture", async ({
  page,
}) => {
  await uploadFile(page, ".bg-slate-200.w-24.h-24.rounded-full.cursor-pointer");
  const imgSelector = "img";
  await expect(page.locator(imgSelector)).toBeVisible();
  const uploadedPhotoSrc = await page.locator(imgSelector).getAttribute("src");
  expect(uploadedPhotoSrc).toContain("blob:");
});
