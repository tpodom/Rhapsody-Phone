# Rhapsody Phone
## Overview
This was a prototype project to investigate building a communication system for [Rhapsody Vet][rhapsody] practice management software (PIMS) with [GoTo Connect][goto] as the communications provider. This prototype was really an opportunity to try out [VueJS 3](https://vuejs.org/) with [Vuetify 3](https://vuetifyjs.com/en/) with a more meaningful purpose.

This project had several goals:

1. Link incoming calls and missed calls to clients with quick context information to improve receptionist efficiency.
2. Provide a single UI for sending and receiving SMS messages sent to the primary practice number. Rhapsody has built-in SMS support but it utilizes a separate phone number for outbound and inbound messages. With this solution, customers could text the main practice number and receptionists could see all inbound and outbound text messages in a single location and categorize them for quicker processing by practice staff.

This project was started when my wife was in the process of building a Veterinary hospital utilizing Rhapsody as the PIMS. This project was ultimately abandoned because Rhapsody's GraphQL APIs at the time did not provide the ability enough capabilities to support the end goals and a different phone provider was ultimately used instead of [GoTo Connect][goto].

## UI

### Incoming Calls
<img width="1554" alt="Screenshot 2024-09-08 at 4 37 05 PM" src="https://github.com/user-attachments/assets/311b9d06-8ab5-4d99-9f76-6ae984de18f4">

Provide a quick view of incoming calls to link them to known clients with information about their pets, quick links to their records in Rhapsody, upcoming and previous appointments, and current balance.

### Messaging
<img width="1557" alt="Screenshot 2024-09-08 at 4 37 21 PM" src="https://github.com/user-attachments/assets/67c775a7-206e-49c8-ba7b-9b281725faba">

Support for SMS messaging with attachments and labeling to allow handing off to other staff departments.

#### Client Info
<img width="320" alt="Screenshot 2024-09-08 at 4 37 35 PM" src="https://github.com/user-attachments/assets/5cc13101-b88e-4e84-ad1a-1feab1b9b5a8">

Client info provides quick summary of client with links into the client's records in Rhapsody.

#### Labeling
<img width="1473" alt="Screenshot 2024-09-08 at 4 01 55 PM" src="https://github.com/user-attachments/assets/6dddd325-8171-4acf-83e1-bd7f46d87e3d">

Labeling would allow categorizing text messages when handing them off to other department staff to quickly find which messages were medical questions or prescription refill requests.

### Search
<img width="523" alt="Screenshot 2024-09-08 at 4 41 08 PM" src="https://github.com/user-attachments/assets/e8675be6-338f-4841-85e9-161330c6c343">

Typeahead search utilized [Typesense](https://typesense.org/) to index the Firestore records to provide a quick search with formatted search results for messages and filtering on specific labels.

## Development
### Prerequisites
* NodeJS 16

### Setup
Install project dependencies from the root of the workspace:
```sh
npm install
```

### Build
To build the entire project, from the root of the workspace, run:
```sh
npm run build
```

### Running
The easiest way to run the project is to run all of the firebase emulators after build:
```sh
npm run emulators
```
Once the emulators are started, the UI can be accessed at http://localhost:5000.

[rhapsody]: https://rhapsody.vet
[goto]: https://www.goto.com/connect


