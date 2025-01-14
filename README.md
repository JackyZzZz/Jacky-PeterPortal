![petr](https://github.com/icssc-projects/peterportal-public-api/blob/master/public/images/peterportal-banner-logo.png?raw=true)

## About

PeterPortal is a web application aimed to aid UCI students with course discovery and planning. We consolidate public data available on multiple UCI sources on the application to improve the user experience when planning their course schedule.

Features include:
* Course catalog with:
    * Grade distribution graphs/charts
    * Visual prerequisite trees
    * Schedule of classes
    * Reviews
![catalogue](https://github.com/icssc/peterportal-client/assets/8922227/e2e34103-a73e-4fd9-af44-69b707d1e910)
![coursepage](https://github.com/icssc/peterportal-client/assets/8922227/2df5a284-0040-4720-a9be-c08978b6bfb1)
* Professor catalog with:
    * Schedule of classes
    * Grade distribution graphs/charts
    * Reviews
* Peter's Roadmap, a drag-and-drop 4-year course planner

![roadmap](https://github.com/icssc/peterportal-client/assets/8922227/7849f059-ebb6-43b4-814d-75fb850fec01)

## 🔨 Built with

* [PeterPortal API](https://github.com/icssc/peterportal-api-next)
* Express
* React
* SST and AWS CDK
* MongoDB
* GraphQL
* TypeScript

## First time setup
### Committee Members
1. Clone the repository to your local machine:
    ```
    git clone https://github.com/icssc/peterportal-client
    ```

2. Switch to a branch you will be working on.
    ```
    git checkout -b [branch name]
    ```

3. Check your Node version with `node -v`. Make sure you have version 14 or above (18 recommended).

4. Open a terminal window and `cd` into the directory of your repo.

5. Run `npm install` to install all node dependencies for the site and API. This may take a few minutes.

6. Setup the appropriate environment variables provided by the project lead.
### Open Source Contributors
1. Fork the project by clicking the fork button in the top right, above the about section.

2. Clone your forked repository to your local machine
```
git clone https://github.com/<your username>/peterportal-client
```

3. Switch to a branch you will be working on.
```
git checkout -b [branch name]
```

4. Check your Node version with `node -v`. Make sure you have version 14 or above (18 recommended).

5. Open a terminal window and `cd` into the directory of your repo.

6. Run `npm install` to install all node dependencies for the site and API. This may take a few minutes.

7. Create a .env file in the api directory with the following contents:
```
PUBLIC_API_URL=https://api.peterportal.org/rest/v0/
PUBLIC_API_GRAPHQL_URL=https://api.peterportal.org/graphql/
PORT=5000
```
Note: the port should also match the one set up on the frontend's proxy to the backend under `site/src/setupProxy.js` By default this is 5000.

8. (Optional) Set up your own MongoDB and Google OAuth to be able to test features that require signing in such as leaving reviews or saving roadmaps to your account. Add additional variables/secrets to the .env file from the previous step.
```
MONGO_URL=<secret>
SESSION_SECRET=<secret>
GOOGLE_CLIENT=<client>
GOOGLE_SECRET=<secret>
ADMIN_EMAILS=["<your email>"]
```

## Running the project locally (after setup)
1. Open two terminal windows and `cd` into the directory of your repo in each of them.

2. In the first terminal window, enter the client directory with `cd site`. Then run the React development server using `npm start`. Ensure the server is running on port 3000 by default.

3. In the second terminal window, enter the API directory with `cd api`. Then run the Express development server using `npm run dev`. Ensure the server is running on port 5000 by default.

## Our Mission
🎇 Our mission is to improve the UCI student experience with course planning

## Where does the data come from?

We consolidate our data directly from official UCI sources such as: UCI Catalogue, UCI Public Records Office, and UCI WebReg (courtesy of [PeterPortal API](https://github.com/icssc/peterportal-api-next)).

## Bug Report
🐞 If you encountered any issues or bug, please open an issue @ https://github.com/icssc-projects/peterportal-client/issues/new


## Other Disclaimer
✅ Although we consolidate our data directly from official UCI sources, this application is by all means, not an official UCI tool. We stride to keep our data as accurate as possible with the limited support we have from UCI. Please take that into consideration while using this Website.

## Terms & Conditions
📜 There are no hard policies at the moment for utilizing this tool. However, please refrain from abusing the Website by methods such as: sending excessive amount of requests in a small period of time or purposely looking to exploit the system.
