1. create a .env file in the project root directory with the following variables

BASE_URL=https://stage.dmfsluo3q5n8c.amplifyapp.com
EMAIL=
PASSWORD=

SERVICE_CHANNEL_CLIENT_ID=
SERVICE_CHANNEL_CLIENT_SECRET=
SERVICE_CHANNEL_USERNAME=
SERVICE_CHANNEL_PASSWORD=

2. additional setup steps

- sign up with the email and password specified in the .env
- open the user page for that user and change license to Premium
- open the settings page and connect to QuickBooks

3. run tests using the following commands

npm test - run all tests

FILE=tests/folder/\* npm test - run all tests for a directory

FILE=tests/folder/test.spec.ts npm test - run all tests for a file

4. the very first time you run a test it might timeout because most tests create some test data before running

5. any time a test fails save the logs and video and then report it so the test can be fixed
