import { test, expect } from '@playwright/test';
import { uploadFile } from '@/utils';

test('uploadFile helper attaches a file to an input', async ({ page }) => {
  // Small page with a hidden input and a button that triggers it
  await page.setContent(`
    <input id="fileInput" type="file" />
    <button id="fileBtn" onclick="document.getElementById('fileInput').click()">Upload</button>
  `);

  // Call the helper which will click the button and set the file via filechooser
  const result = await uploadFile(page, '#fileBtn');
  expect(result).toBe('1.jpeg');

  // Verify the input now has the file attached
  const fileName = await page.evaluate(() => {
    const input = document.getElementById('fileInput') as HTMLInputElement | null;
    return input?.files?.[0]?.name || null;
  });
  expect(fileName).toBe('1.jpeg');
});
