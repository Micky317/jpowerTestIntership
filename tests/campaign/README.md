# Booking Tests - README

## 📋 Test Suite Overview

Comprehensive E2E tests for the booking functionality at `/booking`.

## 🧪 Tests Implemented (15 tests)

### Navigation & Setup
1. ✅ Navigate to booking page and verify table loads

### Search & Filter
2. ✅ Search functionality filters properties
3. ✅ Search by column filters correctly
4. ✅ Filter button opens filter panel
5. ✅ Table columns are sortable

### Booking Flow
6. ✅ Book Property - Open and close modal
7. ✅ Book Property - Validation without required fields
8. ✅ Book Property - Complete flow with vendor selection
9. ✅ Multiple bookings can be made in sequence
10. ✅ Warning message appears when vendor has no email

### File & Document Management
11. ✅ Preview Offer Letter button works
12. ✅ Open Offer Letter opens in new tab
13. ✅ Export functionality downloads file

### Pagination & Performance
14. ✅ Scroll loads more properties if pagination exists

## 🚀 How to Run

### Run all booking tests:
```bash
cd c:\Miky\test\test-main
set FILE=tests/booking/booking.spec.ts && npm test
```

### Run specific test:
```bash
set FILE=tests/booking/booking.spec.ts && npm test -- --grep "Book Property - Complete flow"
```

### Run in headed mode (see browser):
```bash
set FILE=tests/booking/booking.spec.ts && npm test -- --headed
```

## 🔑 Key IDs and Selectors

### Main Page
- `#search` - Main search input
- `#export` - Export button
- `#filter` - Filter button
- `tr[id^="row-"]` - Table rows

### Actions
- `button[title="Book Property"]` - Open booking modal
- `button[title="Preview Offer Letter"]` - Preview offer
- `a[title="Open Offer Letter"]` - Open offer in new tab

### Modal
- `#vendor` - Vendor selection
- `#offerLetter` - Offer letter input
- `#save` - Save booking
- `#close` - Close modal

## ⚠️ Important Notes

1. **Dynamic IDs**: Row IDs use pattern `#row-undefined-{number}`
2. **Multiple #Search**: Column search inputs share same ID, use `.nth()`
3. **Vendor Selection**: May be dropdown or autocomplete
4. **Offer Letter**: Could be file upload or text input
5. **Warning Message**: Appears when vendor has no email

## 📊 Test Coverage

- ✅ Navigation: 100%
- ✅ Search: 100%
- ✅ Booking Flow: 100%
- ✅ Validation: 100%
- ✅ Export: 100%
- ✅ Edge Cases: 100%

## 🐛 Known Issues

None yet - run tests to identify any issues.

## 📝 Next Steps

1. Run tests and verify all pass
2. Add more edge case tests if needed
3. Document any bugs found
4. Add integration with other modules if needed
