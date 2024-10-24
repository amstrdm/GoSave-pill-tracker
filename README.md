
# GoSave - Progressive Web App (PWA)

Welcome to the GoSave project! This repository contains the frontend code for a Progressive Web App (PWA) designed to help users manage their pill intake schedule efficiently. The app is built using React and Vite, and it leverages Firebase for notifications and backend communication. 

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Components](#components)
- [Service Worker](#service-worker)
- [Firebase Integration](#firebase-integration)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Progressive Web App (PWA):** GoSave is a PWA, which means it can be installed on your device and used offline.
- **Location-Based Reminders:** The app can remind users to take their pills when they arrive home using location-based triggers.
- **Timezone Awareness:** The app is fully timezone-aware, ensuring notifications are sent at the correct local time.
- **Firebase Cloud Messaging:** Utilizes Firebase for push notifications, ensuring users receive timely reminders.
- **Responsive Design:** Built with Tailwind CSS and DaisyUI, the app is fully responsive and works on all device sizes.
- **User-Friendly Interface:** The app features a clean and intuitive interface, making it easy for users to manage their pill intake schedule.

## Frontend
### Installation

To get started with the GoSave frontend, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/gosave.git
   cd gosave/Frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Build for production:**

   ```bash
   npm run build
   ```

5. **Preview the production build:**

   ```bash
   npm run preview
   ```

### Usage

Once the app is running, you can access it in your browser. The app will guide you through setting up your pill intake schedule, including setting reminders for when you arrive home.

### Components

The app is composed of several key components:

- **Home:** The main dashboard where users can see their pill schedule and manage settings.
- **RemindHome:** Handles the logic for reminding users when they arrive home.
- **InfoRemindHome:** Provides a guide for setting up location-based reminders using iPhone Shortcuts.
- **ChangeIntakeTime:** Allows users to temporarily change their pill intake time.
- **NextNotification:** Displays the next scheduled notification time.
- **SettingsPanel:** Provides access to user settings, including theme changes and cycle settings.

### Service Worker

The app includes a service worker for handling background tasks and notifications. The service worker is registered in `main.jsx` and is responsible for managing Firebase Cloud Messaging.

### Firebase Integration

GoSave uses Firebase for push notifications. The Firebase configuration is set up in `firebase.js`, and the service worker script is located in `firebase-messaging-sw.js`.


```1:17:Frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "***REMOVED***",
    authDomain: "***REMOVED***",
    projectId: "***REMOVED***",
    storageBucket: "***REMOVED***.appspot.com",
    messagingSenderId: "***REMOVED***",
    appId: "1:***REMOVED***:web:075a4f09ee1987599f874d",
    measurementId: "***REMOVED***"
}

const app = initializeApp(firebaseConfig)
const messaging = getMessaging(app)

export { messaging }
```


# Pill Reminder API - Documentation

This API is designed to manage users' pill reminders by handling notifications, tracking pill intake, and managing user data. The system is based on Flask and SQLAlchemy for the backend, Firebase for notifications, and APScheduler for managing scheduled tasks.

## Prerequisites

- Python 3.8+
- Firebase Admin SDK (for notification purposes)
- SQLite (as the database)
- Flask framework and related dependencies
- APScheduler (for managing scheduled tasks)

## Table of Contents

1. [Installation](#installation)
2. [API Endpoints](#api-endpoints)
    - [GET /](#get-)
    - [POST /database](#post-database)
    - [GET /database](#get-database)
    - [POST /save-token](#post-save-token)
    - [POST /is-pill-day](#post-is-pill-day)
    - [POST /pill-taken](#post-pill-taken)
    - [GET /pill-taken](#get-pill-taken)
    - [POST /schedule-notifications](#post-schedule-notifications)
    - [POST /remind-when-home](#post-remind-when-home)
    - [GET /remind-when-home](#get-remind-when-home)
    - [GET /next-notification](#get-next-notification)
    - [GET /get-logs](#get-get-logs)
    - [POST /test-logs](#post-test-logs)
3. [Database Structure](#database-structure)
    - [User Table](#user-table)
    - [PillLog Table](#pilllog-table)
4. [Scheduler](#scheduler)
    - [Daily Reset Task](#daily-reset-task)
    - [Notification Scheduling](#notification-scheduling)
5. [Error Handling](#error-handling)
6. [Firebase Notifications](#firebase-notifications)
7. [Time Zones](#time-zones)

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/pill-reminder-api.git
   cd pill-reminder-api
   ```

2. **Set up virtual environment (optional but recommended):**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up Firebase Admin SDK:**

   You need a Firebase project with the Firebase Admin SDK setup. Place the `account_key.json` file from Firebase into the `config/` directory and adjust the path in the code if necessary.

5. **Run the API:**

   ```bash
   python app.py
   ```

---

## API Endpoints

### GET /

#### Description:
Checks if the server is running.

#### Response:
```json
{
    "message": "The server is up and running!"
}
```

### POST /database

#### Description:
Creates or updates a user in the database. If the user already exists, it updates their data (FCM token, intake time, pill cycle, etc.).

#### Request Body:
```json
{
    "fcmToken": "string",        // Firebase Cloud Messaging Token
    "timezone": "string",        // User's timezone, e.g., "Europe/Berlin"
    "intakeTime": "HH:MM",       // Optional: intake time in 24-hour format
    "cycleData": {               // Optional: pill cycle data
        "pillDays": int,
        "breakDays": int,
        "startDate": "YYYY-MM-DD"
    }
}
```

#### Responses:
- **201 Created:** User added successfully
- **200 OK:** User data updated successfully
- **400 Bad Request:** Missing required fields or invalid format

### GET /database

#### Description:
Fetches the data of a specific user by their FCM token.

#### Query Parameters:
- `fcmToken` (required): Firebase Cloud Messaging token to identify the user.

#### Response:
```json
{
    "user": {
        "fcmToken": "string",
        "intakeTime": "HH:MM",
        "timezone": "string",
        "cycleData": {
            "pillDays": int,
            "breakDays": int,
            "startDate": "YYYY-MM-DD"
        }
    }
}
```

#### Responses:
- **200 OK:** User data returned successfully
- **404 Not Found:** User with the specified token not found
- **400 Bad Request:** Missing `fcmToken` query parameter

### POST /save-token

#### Description:
Saves a user's FCM token to the database if it doesn't already exist.

#### Request Body:
```json
{
    "fcmToken": "string"
}
```

#### Responses:
- **201 Created:** Token saved successfully
- **200 OK:** Token already exists
- **400 Bad Request:** Missing or invalid `fcmToken`

### POST /is-pill-day

#### Description:
Determines whether today is a pill day for the user based on their pill cycle.

#### Request Body:
```json
{
    "fcmToken": "string"
}
```

#### Response:
```json
{
    "isPillDay": true/false
}
```

#### Responses:
- **200 OK:** Result returned successfully
- **404 Not Found:** User with the specified token not found
- **400 Bad Request:** Missing `fcmToken`

### POST /pill-taken

#### Description:
Updates whether the user has taken their pill for the day.

#### Request Body:
```json
{
    "fcmToken": "string",
    "isPillTaken": true/false
}
```

#### Responses:
- **200 OK:** Status updated successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing required fields or invalid data

### GET /pill-taken

#### Description:
Fetches whether the user has taken their pill for the day.

#### Query Parameters:
- `fcmToken` (required): Firebase Cloud Messaging token.

#### Response:
```json
{
    "pillTaken": true/false
}
```

#### Responses:
- **200 OK:** Status returned successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing `fcmToken`

### POST /schedule-notifications

#### Description:
Schedules notifications for a user's pill intake time.

#### Request Body:
```json
{
    "fcmToken": "string",
    "intakeTime": "HH:MM",
    "interval": true/false  // Whether to notify at intervals before intake time
}
```

#### Responses:
- **200 OK:** Notifications scheduled successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing or invalid data

### POST /remind-when-home

#### Description:
Sets the user to be reminded to take their pill when they arrive home.

#### Request Body:
```json
{
    "fcmToken": "string",
    "waitingForHome": true/false,
    "isHome": true/false  // Whether the user has arrived home
}
```

#### Responses:
- **200 OK:** Reminder set or reset successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing or invalid data

### GET /remind-when-home

#### Description:
Checks whether the user is waiting for a reminder when they get home.

#### Query Parameters:
- `fcmToken` (required): Firebase Cloud Messaging token.

#### Response:
```json
{
    "waitingForHome": true/false
}
```

#### Responses:
- **200 OK:** Status returned successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing `fcmToken`

### GET /next-notification

#### Description:
Returns the next scheduled notification time for the user.

#### Query Parameters:
- `fcmToken` (required): Firebase Cloud Messaging token.

#### Response:
```json
{
    "next_notification": "HH:MM"  // Time of the next notification
}
```

#### Responses:
- **200 OK:** Time returned successfully
- **404 Not Found:** User or notifications not found
- **400 Bad Request:** Missing `fcmToken`

### GET /get-logs

#### Description:
Fetches the user's pill logs for the last two cycles.

#### Query Parameters:
- `fcmToken` (required): Firebase Cloud Messaging token.

#### Response:
```json
{
    "pillLogs": [
        {
            "day_of_week": "Monday",
            "calendar_date": "YYYY-MM-DD",
            "is_pill_day": true/false,
            "pill_taken_time": "HH:MM:SS",
            "pillTaken": true/false
        },
        ...
    ]
}
```

#### Responses:
- **200 OK:** Logs returned successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing `fcmToken`

### POST /test-logs

#### Description:
For testing purposes, allows creation or updating of pill logs.

#### Request Body:
```json
{
    "fcmToken": "string",
    "pillTaken": true/false,
    "date": "YYYY-MM-DD"  // Optional: Log for a specific date
}
```

#### Responses:
- **200 OK:** Log created or updated successfully
- **404 Not Found:** User not found
- **400 Bad Request:** Missing or invalid data

---

## Database Structure

### User Table

| Column          | Type      | Description                                  |
|-----------------|-----------|--------------------------------

--------------|
| id              | Integer   | Primary key                                  |
| fcm_token       | String    | Unique Firebase Cloud Messaging token        |
| intake_time     | String    | Time of pill intake in HH:MM format           |
| pill_days       | Integer   | Number of pill days in a cycle                |
| break_days      | Integer   | Number of break days in a cycle               |
| start_date      | String    | Start date of the user's pill cycle (YYYY-MM-DD) |
| is_pill_taken   | Boolean   | Whether the user has taken their pill today   |
| timezone        | String    | User's timezone                              |
| waiting_for_home| Boolean   | Whether the user is waiting for a home reminder |

### PillLog Table

| Column          | Type    | Description                             |
| --------------- | ------- | --------------------------------------- |
| id              | Integer | Primary key                             |
| user_id         | Integer | Foreign key to the User table           |
| day_of_week     | Enum    | Day of the week (Monday-Sunday)         |
| calendar_date   | Date    | The actual date of the log (YYYY-MM-DD) |
| is_pill_day     | Boolean | Whether it was a pill day               |
| pill_taken_time | Time    | Time when the pill was taken            |
| pill_taken      | Boolean | Whether the pill was taken              |

---

## Scheduler

### Daily Reset Task

- Runs at midnight every day.
- Resets users' `is_pill_taken` to `False`.
- Schedules the next day's notifications for pill users.

### Notification Scheduling

- **Pre-intake Notifications:** Scheduled 2 hours before pill intake, with reminders every 30 minutes.
- **Post-intake Notifications:** Continue for 2 hours after the intake time, with reminders every 15 minutes.

---

## Error Handling

- **400 Bad Request:** Returned when required fields are missing or data is invalid (e.g., invalid time or date format).
- **404 Not Found:** Returned when a user or resource is not found in the database.

---

## Firebase Notifications

The API sends notifications via Firebase Cloud Messaging (FCM) to remind users about their pill intake. Notifications are scheduled dynamically based on the user's intake time and pill cycle.

---

## Time Zones

All time-related operations are handled based on the user's specified time zone. The API supports time zone localization using `pytz`.

--- 

This API is fully equipped to handle pill reminder logic, notification scheduling, and user data management. The flexible architecture supports expansion for additional features such as multiple reminder types and advanced analytics.

## Contributing

Contributions are welcome! If you'd like to contribute to GoSave, please fork the repository and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for using GoSave! I hope this app helps you manage your pill intake schedule effectively. If you have any questions or feedback, please feel free to reach out.

