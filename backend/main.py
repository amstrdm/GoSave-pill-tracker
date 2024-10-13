from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
from datetime import timedelta
from os import path
import firebase_admin
from firebase_admin import credentials, messaging
from flask_apscheduler import APScheduler
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from colorama import Fore, Style



# Initialize Firebase Admin SDK
cred = credentials.Certificate("account_key.json")
firebase_admin.initialize_app(cred)

# Initialize Database
db = SQLAlchemy()
DB_NAME = "database.db"

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app=app)
db.init_app(app)

# Initialize APScheduler
class Config:
    SCHEDULER_API_ENABLED = True
    SCHEDULER_JOBSTORES = {
        "default": SQLAlchemyJobStore(url=f"sqlite:///jobs.sqlite")
    }
    SCHEDULER_EXECUTORS = {
        "default": ThreadPoolExecutor(10)
    }

app.config.from_object(Config())

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fcm_token = db.Column(db.String(255), unique=True)
    intake_time = db.Column(db.String(5)) # Stored as HH:MM
    pill_days = db.Column(db.Integer)
    break_days = db.Column(db.Integer)
    start_date = db.Column(db.String(10)) # Stored as YYYY-MM-DD


def create_database(app):
    if not path.exists(DB_NAME):
        db.create_all(app=app)
        print("Created Database!")


@app.route("/database", methods=["GET", "POST"])
def database():
    if request.method == "POST":
        data = request.get_json()
        print("\n\nReceived data to be saved to Database:", data)

        fcm_token = data.get("fcmToken")
        if not fcm_token:
            return jsonify({"error": "fcmToken is required"}), 400
        
        # Check if user with the fcm_token already exists
        user = User.query.filter_by(fcm_token=fcm_token).first()
        
        # Extract values from request only if they exist, otherwise leave them as None
        intake_time = data.get("intakeTime") 
        cycle_data = data.get("cycleData", {}) # default to empty dict if not provided

        pill_days = cycle_data.get("pillDays")
        break_days = cycle_data.get("breakDays")
        start_date = cycle_data.get("startDate")

        #Check if passed time is valid
        if intake_time:
            try:
                # Try to parse the time in HH:MM format
                validated_intake_time = datetime.datetime.strptime(intake_time, '%H:%M')
            except ValueError:
                return jsonify({"error": "Invalid time format"}), 400

        #Check if passed Date is valid
        if start_date:
            try:
                validated_start_date = datetime.datetime.strptime(cycle_data["startDate"], "%Y-%m-%d")
            except ValueError:
                return(jsonify({"error": "invalid date format"})), 400

        
        # if user exists, update the fields that are passed in request
        if user:
            print(user)
            if intake_time:
                user.intake_time = intake_time
            if pill_days is not None:
                user.pill_days = pill_days
            if break_days is not None:
                user.break_days = break_days
            if start_date:
                user.start_date = start_date
            
            db.session.commit()
            return jsonify({"message": "User Data Updated successfully"}), 200
        
        else:
            # If user doesn't exist create new record with given data
            # For any missing field pass None  to Database
            new_user = User(
                fcm_token=fcm_token,
                intake_time=intake_time if intake_time else None,
                pill_days=pill_days if pill_days is not None else None,
                break_days=break_days if break_days is not None else None,
                start_date=start_date if start_date else None
            )

            db.session.add(new_user)
            db.session.commit()
            return jsonify({"message": "User added successfully"}), 201
    
    elif request.method == "GET":
        #extract fcm token from query
        fcm_token = request.args.get("fcmToken")

        if fcm_token:
            # Query User by fcm token
            user = User.query.filter_by(fcm_token=fcm_token).first()

            if user:
                # Return user data if found
                user_data = {
                    "fcmToken": user.fcm_token,
                    "intakeTime": user.intake_time,
                    "cycleData": {
                        "pillDays": user.pill_days,
                        "breakDays": user.break_days,
                        "startDate": user.start_date
                    }
                }
                print(user_data)
                return jsonify({"user": user_data}), 200
            else:
                return jsonify({"error:" "User not found"}), 404
        else:
            return jsonify({"error": "fcmToken query parameter is required"}), 400

# We could also send a request to the database endpoint to save the token by providing nothing but the token itself.
# However this feels like more verbose solution and highlights the flow more clearly sincet he token only has to be saved
# when first generating/getting it.
@app.route("/save-token", methods=["POST"])
def save_token():
    data = request.get_json()
    fcm_token = data.get("fcmToken")
    print("received token: ", fcm_token)

    if not fcm_token:
        return jsonify({"error": "Token is required"}), 400
        

    # Check if the user with the fcm_token already exists
    user = User.query.filter_by(fcm_token=fcm_token).first()

    if user:
        return jsonify({"message": "Token already exists"}), 200
    else:
        # Create a new user record if the user doesn't exist
        new_user = User(fcm_token=fcm_token)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Token saved successfully"}), 201

"""
@app.route("/send-notification", methods=["POST"])
def send_notification():

    data = request.get_json()
    fcm_token = data.get("fcmToken")

    # Create Message
    message = messaging.Message(
        notification=messaging.Notification(
            title='Hello!',
            body='You have a new message.',
        ),
        token=fcm_token
    )
    
    try:
        response = messaging.send(message)
        return f"message sent: {response}"
    except Exception as e:
        return f"Error sending Message: {e}"

"""


def format_time(intake_time, current_time):
    intake_time = datetime.datetime.strptime(intake_time, "%H:%M")
    current_time = datetime.datetime.strptime(current_time, "%H:%M")

    time_difference = intake_time - current_time

    # Get hours and minutes from the timedelta
    hours, remainder = divmod(time_difference.seconds, 3600)
    minutes = remainder // 60

    # Format the output as HH:MM
    if minutes == 0:
        formatted_difference = hours
    else:
        formatted_difference = f"{hours}:{minutes:02d}"  # :02d ensures two digits for minutes

    return formatted_difference

def send_notification(fcm_token, title, body):


    # Create Message
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        token=fcm_token
    )
    
    try:
        response = messaging.send(message)
        return f"message sent: {response}"
    except Exception as e:
        return f"Error sending Message: {e}"

def cancel_existing_notifications(fcm_token):
    for job in scheduler.get_jobs:
        if job.id.startswith(fcm_token):
            job.remove()

def schedule_notifications(intake_time, fcm_token):
    # Will check if there are scheduled notifications for the day. If there are clear them.
    # Afterwards it will schedule notifications based on the passed intake time:
        # 2 hours before intake time
        # notification every 30 minutes until intake time
        # after that every 15 minutes until 2 hours past intake time
     
    # First cancel all existing notifications 
    cancel_existing_notifications(fcm_token)

    # Parse Time
    intake_time = datetime.datetime.strptime(intake_time, '%H:%M')
    
    # Calculate start and end of notification window 
    start_time = intake_time - timedelta(hours=2)
    end_time = intake_time + timedelta(hours=2)

    # Schedule notifications 2 hours before intake every 30 minutes 
    # Increasing current_time by 30 minutes each loop until it is greater than intake_time in which case it will break the loop
    current_time = start_time
    while current_time <= intake_time:
        scheduler.add_job(
            send_notification,
            "date",
            run_date=current_time,
            args=[fcm_token, "Your Pill time is coming up!", f"It's {format_time(intake_time, current_time)} before your Intake time. Take your Pill!"],
            id=f"{fcm_token}_{current_time.isoformat()}"
        )
        current_time += timedelta(minutes=30)
    
    # After intake time, schedule notifications every 15 minutes until 2 hours after
    current_time = intake_time
    while current_time <= end_time:
        scheduler.add_job(
            send_notification,
            "date",
            run_date=current_time,
            args=[fcm_token, "Your intake Time passed!", f"It's {format_time(intake_time, current_time)} PAST your Intake time. Take your Pill QUICKLY!"],
            id=f"{fcm_token}_{current_time.isoformat()}"
        )
        current_time += timedelta(minutes=15)

    print(f"Scheduled notifications for {fcm_token}\n")

# To check if it is a pill day or not we take the total length of the cycle and use modulus arithmetic to 
# calculate the current position within the recurring cycle.
# Since the cycle always starts with the pill days we now just have to check if day in cycle is smaller than or equal to
# our pill days. If it is that means we aren't past the pill days yet and we can return true.
def is_pill_day(pill_days, break_days, start_date_str, current_date=None):
    if current_date is None:
        current_date = datetime.date.today()
    start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
    days_since_start = (current_date-start_date).days
    cycle_length = pill_days + break_days
    day_in_cycle = days_since_start % cycle_length 
    return day_in_cycle <= pill_days



# The reset_day_all function will run every day at 12:00 PM
@scheduler.task("cron", id="reset_day_all", hour=12, minute=0)
def reset_day_all():

    # Variable to count how many people had their pill day at execution
    pill_day_count = 0

    # Query all Users
    users = User.query.all()

    # Loop through each user: Check if it's a pill day. If it is schedule notifications
    for user in users: 
        fcm_token = user.fcm_token
        intake_time = user.intake_time
        pill_days = user.pill_days
        break_days = user.break_days
        start_date = user.start_date

        is_pill_day = is_pill_day(pill_days, break_days, start_date_str=start_date)

        if is_pill_day:
            schedule_notifications(intake_time, fcm_token)
            pill_day_count += 1

    print(f"Finished scheduling user notifications. {User.query.count()} total users of which {pill_day_count} had their pill day")

# Function to set up notifications when a user first registers
# Essntially does the same thing as reset_day_all but only to a given user instead of looping htrough the whole DB
@app.route("/schedule-notifications", ["POST"])
def reset_day_individual():
    data = request.get_json()
    fcm_token = data.get("fcmToken")

    if fcm_token:
        is_pill_day()
        user = User.query.filter_by(fcm_token=fcm_token).first()
        if user:
            is_pill_day = is_pill_day(pill_days=user.pill_days, break_days=user.break_days, start_date_str=user.start_date)
            if is_pill_day:
                schedule_notifications(intake_time=user.intake_time, fcm_token=fcm_token)
        else:
            return jsonify({"error": f"Could not find user {fcm_token} in database"})
    else:
        return jsonify({"error": "fcmToken is required"}), 400

@app.route("/pill-taken", ["POST"])
def pill_taken():
    data = request.get_json
    fcm_token = data.get("fcmToken")

    cancel_existing_notifications(fcm_token)

create_database(app)

if __name__ == "__main__":
    app.run(debug=True)