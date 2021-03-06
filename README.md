# OKR Tracker

- [Clone and install](#clone-and-install)
- [Set up new instance](#set-up-new-instance)
  - [Create Firebase project](#create-firebase-project)
    - [Enable Google Auth in Firebase](#enable-google-auth-in-firebase)
  - [Environment variables](#environment-variables)
  - [Link project](#link-project)
  - [Create mock data](#create-mock-data)
    - [Whitelist yourself](#whitelist-yourself)
    - [Generate mock data](#generate-mock-data)
    - [Exporting mock data](#exporting-mock-data)
    - [Update mock data](#update-mock-data)
- [Run locally](#run-locally)
- [Build and deploy](#build-and-deploy)
- [Lint and fix](#lint-and-fix)
- [Import production data from Cloud Firestore to local Firestore](#import-production-data-from-cloud-firestore-to-local-firestore)
  - [Requirements](#requirements)
  - [Export production data](#export-production-data)
- [Import production data](#import-production-data)
- [Automated Backup with Cloud Functions](#automated-backup-with-cloud-functions)
  - [Requirements for automated backups](#requirements-for-automated-backups)
  - [Automated Restore with Cloud Functions](#automated-restore-with-cloud-functions)
- [Slack Integration](#slack-integration)
  - [Set up](#set-up)

## Clone and install

Clone repository and run install:

```bash
npm install && cd ./functions && npm install && cd ..
```

Install Firebase CLI:

```bash
npm install -g firebase-tools
```

## Set up new instance

Follow this guide to set up a new clean instance of the OKR-tracker.

### Create Firebase project

- Create a [Google Firebase](https://firebase.google.com) project.
- [Initialize the project](https://firebase.google.com/docs/cli#initialize_a_firebase_project) with Firebase CLI
- Create a Google service account
  - From the **Project Overview**, select **Service accounts**
  - Click **Generate new private key**

This key is used for fetching data from Google Sheets (for automatically updating key results). In order to fetch data from Google Sheets, you must set up environment variables for Firebase Functions:

```bash
firebase functions:config:set
  sheets.email="<service account email>"
  sheets.key="<service account private key>"
```

**Note: The private key string needs to have actual line breaks as opposed to `\\n` because of an issue with how Firebase stores environment variables. [Read more](https://github.com/firebase/firebase-tools/issues/371).**

#### Enable Google Auth in Firebase

We use Google Auth to authenticate users and this needs to be enabled in the Firebase Console.

- Navigate to your project in the [Firebase console](https://console.firebase.google.com/)
- Press the **Authentication**-button in the side menu
- **Sign-in Method**-tab
- Enable Google Auth

### Environment variables

Get your Firebase SDK snippet from your [Firebase Console](https://console.firebase.google.com/):

- Navigate to **Project settings**
- Under **Your apps**, find Firebase SDK snippet and press **Config**
- Copy the following secrets to a `.env.production` file in the root directory.

| Secret                           | Description               |
| -------------------------------- | ------------------------- |
| `VUE_APP_API_KEY`                | _from SDK snippet_        |
| `VUE_APP_AUTH_DOMAIN`            | _from SDK snippet_        |
| `VUE_APP_DATABASE_URL`           | _from SDK snippet_        |
| `VUE_APP_PROJECT_ID`             | _from SDK snippet_        |
| `VUE_APP_STORAGE_BUCKET`         | _from SDK snippet_        |
| `VUE_APP_MESSAGING_SENDER_ID`    | _from SDK snippet_        |
| `VUE_APP_APP_ID`                 | _from SDK snippet_        |
| `VUE_APP_MEASUREMENT_ID`         | _from SDK snippet_        |
| `VUE_APP_SHEETS_SERVICE_ACCOUNT` | \<service account email\> |
| `VUE_APP_I18N_LOCALE`            | `nb-NO \| en-US`          |

### Link project

```bash
firebase use --add
```

### Create mock data

The local development environment uses [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite) for Firestore and Cloud Functions. The Auth module is still remote, so you will need to add your own email address to the emulated store before getting started.

Start the Firebase Emulator:

```bash
firebase emulators:start
```

In a new terminal window, start run the local web server:

```bash
npx vue-cli-service serve
```

#### Whitelist yourself

Then whitelist your own email address by manually inserting it to the emulated Firestore:

1. Navigate to [http://localhost:7777/firestore](http://localhost:7777/firestore)
2. Click **Start collection**
3. Type 'users' as collection ID and hit **Next**
4. Insert your own Google Account-email as Document ID. Create a new field 'admin' with type _boolean_ and value `true` and a new field 'email' with type _string_ and the same email address as value.
5. Click **Save**

Confirm the access by visiting [http://localhost:8080/](http://localhost:8080/), press **Sign in with Google** and select your Google Account.

#### Generate mock data

After successfully logging in to the OKR Tracker, navigate to the [Admin panel](http://localhost:8080/admin). Here you can create new organisations, departments and products to use as your mock data. On each object you can also create periods, objectives, key results and KPIs.

#### Exporting mock data

To export your mock data run the following command:

```bash
firebase emulators:export ./mock
```

#### Update mock data

To update existing mock data, simply run the export command above and confirm overwrite existing export.

## Run locally

Retrieve current Firebase environment configuration. This is needed for certain cloud functions to function locally.

```bash
firebase functions:config:get > ./functions/.runtimeconfig.json
```

Start Firebase emulators, import mock data and run the development server:

```bash
npm run dev
```

## Build and deploy

Build and deploy to production:

```bash
npm run deploy
```

## Lint and fix

Run linter

```bash
npm run lint
```

Lint styles

```bash
npm run lint:style
```

Automatically fix lint issues

```bash
npm run lint:style:fix
```

## Import production data from Cloud Firestore to local Firestore

Based on [this tutorial](https://medium.com/firebase-developers/how-to-import-production-data-from-cloud-firestore-to-the-local-emulator-e82ae1c6ed8) with a few differences for our use case.

The newest version of the OKR Tracker uses the Firebase Local Emulator Suite, where you can play and test your data without being afraid of production changes. It is still in the early stages, which means that auth is still handled by the cloud firebase and not locally.

When you start up the local Firestore emulator you can see that the Firestore is completely empty because we don't have any production data. This is an amazing way of working because you can do what ever you want without doing damages, but it's real life data that you most likely want to test and fix.

We are going to show you how you can export your production data to a GCP bucket or use an existing backed up bucket to import into your local Firestore.

### Requirements

```
- Firebase CLI
- Google Cloud SDK
```

How to install [Google Cloud SDK](https://cloud.google.com/sdk/install) and [Firebase CLI](https://firebase.google.com/docs/cli)

### Export production data

Login to Firebase and Google Cloud

```bash
firebase login
gcloud auth login
```

See the list of your projects and connect to the on you'd like to export data from:

```bash
firebase projects:list
firebase use <your project id>

gcloud projects list
gcloud config set project <your project id>
```

For the sake of this how to, we'll be using `okr-tracker-production` (production) for gcloud, and `origo-okr-tracker` (development) for the Firebase. The reason is that we use auth from our development Firebase instance, and not from the production instance.

If you don't already have automated backups of your production data, we will need to export the production data to a backup on GCP:

```bash
gcloud firestore export gs://okr-tracker-production.appspot.com/<backup-folder-name>
```

Now copy the new folder to your local machine, we are going to do this from our functions folder:

```bash
cd functions
gsutil -m cp -r gs://okr-tracker-production.appspot.com/<backup-folder-name> .
```

If you already have automated backups of your production data, you don't need to export the production data, only import it. For this application our backup folder is not part of the Firebase storage bucket:

```bash
gsutil -m cp -r gs://okr-tracker-backup/<YYYY-MM-DD>
```

## Import production data

To import the production data into your local Firebase emulator, you will need a metadata-file on the root folder, named `firebase-export-metadata.json`:

```json
{
  "version": "8.6.0",
  "firestore": {
    "version": "1.11.5",
    "path": "functions/<backup-folder-name>",
    "metadata_file": "functions/<backup-folder-name>/<backup-folder-name>.overall_export_metadata"
  }
}
```

Start your local Firebase emulator suite with the imported data. Firebase will read the metadata-json file automatically.

```bash
firebase emulators:start --import=./
```

## Automated Backup with Cloud Functions

We use cloud functions to backup our database every night and only keep backup of the last 14 days. If a backup is older than 14 days it gets automatically and permanently deleted from the storage bucket.

### Requirements for automated backups

- Firebase Blaze plan
- Set IAM Permission
- Manually create a storage bucket
- Cloud function

You can follow [this tutorial](https://thecloudfunction.com/blog/firebase-cloud-functions-automated-backups/) on how to create automated backups.

TLDR:

- Navigate to **Google Cloud Console** and choose your project
- Navigate to IAM & Admin - Your App Engine Service account needs the **Cloud Datastore Import Export Admin** role
- Navigate to **Storage** – Create a storage bucket – Give it a rule to delete storage that is >14 days old
- Run the command `firebase functions:config:set storage.bucket="<your-storage-bucket-name>"`

### Automated Restore with Cloud Functions

This is called automated restore but we still need to manually trigger a cloud function that does the restore from the Google Cloud Console

Follow this [tutorial](https://thecloudfunction.com/blog/firebase-cloud-functions-recovery-backups/)

TLDR:

- From your Google Cloud Console navigate to **PubSub**
- Create a topic and name it 'restore-backup'
- Trigger the topic by publishing a message and the restore will be triggered

Gif of the process:

![Gif of the process src: thecloudfunction-blog](./documentation/recovery.gif)

Src/Citation: [The cloud function blog](https://thecloudfunction.com/blog/firebase-cloud-functions-recovery-backups/)

## Slack Integration

We have a slack integration that is connected with a couple of cloud functions.

There are two cloud functions that integrate with slack

1. `handleSlackRequest` - users requesting access - slack app posts to a channel that someone wants access
2. `handleSlackInteractive` - button actions from channel - user presses accept/reject/ignore and slack app posts to a cloud function that gives access to a user or rejects it

For these cloud functions to work you need to add a webhook url from a slack app.

### Set up

Firebase steps:

1. Open your gcloud console and go to IAM section
2. Give your Firebase account `Pub/Sub subscriber` role

Slack steps:

1. Go to slack application page and create a new app or go to your existing app
2. Activate `Incoming Webhooks` and create a new Webhook URL
3. Activate `Interactivity and Shortcuts` and add a new request URL which points to your Cloud Function

Copy the webhook URL and inject it into Firebase as an environment variable:

```bash
firebase functions:config:set slack.deploymentWebhook="YOUR SLACK WEBHOOK HERE"

Request URL: https://<region>-<firebase-instance>.cloudfunctions.net/slackNotificationInteractiveOnRequest
```
