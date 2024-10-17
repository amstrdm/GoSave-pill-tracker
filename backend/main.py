from flask import Flask, request, jsonify, has_request_context
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import datetime
from datetime import timedelta
import os 
from os import path
import firebase_admin
from firebase_admin import credentials, messaging
from flask_apscheduler import APScheduler
from apscheduler.executors.pool import ThreadPoolExecutor
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
import pytz


# Initialize Firebase Admin SDK
cred = credentials.Certificate("config/account_key.json")
firebase_admin.initialize_app(cred)

app = Flask(__name__, instance_relative_config=True)


if not path.exists(app.instance_path):
    os.makedirs(app.instance_path)

# Initialize Database
db = SQLAlchemy()
JOB_STORE_NAME = path.join(app.instance_path, "jobs.sqlite")
DB_NAME = path.join(app.instance_path, "database.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app=app)
db.init_app(app)

# Initialize APScheduler
class Config:
    SCHEDULER_API_ENABLED = True
    SCHEDULER_JOBSTORES = {
        "default": SQLAlchemyJobStore(url=f"sqlite:///{JOB_STORE_NAME}")
    }
    SCHEDULER_EXECUTORS = {
        "default": ThreadPoolExecutor(10)
    }
    SCHEDULER_TIMEZONE = pytz.utc

app.config.from_object(Config())

scheduler = APScheduler()
scheduler.init_app(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True) # primary user id
    fcm_token = db.Column(db.String(255), unique=True) # Firebase Cloud Messaging Token. Used to send notifications and as a unqiue identifier for each user
    intake_time = db.Column(db.String(5)) # The permanent Intake Time inputted by the user. Stored as HH:MM
    pill_days = db.Column(db.Integer) # The amount of pill days specified by the user
    break_days = db.Column(db.Integer) # The amount of break days specified by the user
    start_date = db.Column(db.String(10)) # The start date of the cycle. Stored as YYYY-MM-DD
    is_pill_taken = db.Column(db.Boolean, default=False) # A boolean tracking if the user has clicked is_pill_taken
    timezone = db.Column(db.String(50)) # The Users timezone


def create_database(app):
    with app.app_context():
        db.create_all()  # Ensure all tables are created
        print("Ensured all Tables are created")

def str_to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        if value.lower() in ('true', '1'):
            return True
        elif value.lower() in ('false', '0'):
            return False
    raise ValueError("Invalid value for interval")

@app.route("/", methods=["GET"])
def server_up():
    return jsonify({"message": "The server is up and running!"}), 200

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
        timezone = data.get("timezone")
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
            print("Updating Values: ", user)
            if timezone:
                user.timezone = timezone
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
                start_date=start_date if start_date else None,
                timezone=timezone if timezone else "UTC" # Default to UTC if not provided 
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
                    "timezone": user.timezone,
                    "cycleData": {
                        "pillDays": user.pill_days,
                        "breakDays": user.break_days,
                        "startDate": user.start_date
                    }
                }
                print("Returned user data", user_data)
                return jsonify({"user": user_data}), 200
            else:
                return jsonify({"error": "User not found"}), 404
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

    time_difference = intake_time - current_time

    total_seconds = time_difference.total_seconds()

    # Determine if time difference is negative
    if total_seconds >= 0:
        prefix = ''
    else:
        prefix = '-'
        total_seconds = abs(total_seconds)

    # Calculate hours and minutes
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)

    # Format the output as HH:MM
    # Format the output as HH:MM
    formatted_difference = f"{prefix}{hours}:{minutes:02d}"

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
    for job in scheduler.get_jobs():
        if job.id.startswith(fcm_token):
            scheduler.remove_job(job.id)
    
        
            

def schedule_notifications(intake_time, fcm_token, interval):
    # Will check if there are scheduled notifications for the day. If there are clear them.
    # Afterwards it will schedule notifications based on the passed intake time:
        # 2 hours before intake time
        # notification every 30 minutes until intake time
        # after that every 15 minutes until 2 hours past intake time
    
    user = User.query.filter_by(fcm_token=fcm_token).first()

    if user:
        # First cancel all existing notifications 
        cancel_existing_notifications(fcm_token)

        # Parse intake time with user's time zone
        user_timezone = pytz.timezone(user.timezone)
        intake_time_parsed = datetime.datetime.strptime(intake_time, '%H:%M')
        today = datetime.date.today()

        # Create aware datetime in user's local time zone
        intake_datetime_local = datetime.datetime.combine(today, intake_time_parsed.time())
        intake_datetime_local = user_timezone.localize(intake_datetime_local)

        # Convert to UTC for scheduling
        intake_datetime_utc = intake_datetime_local.astimezone(pytz.utc)

        # Return passed_time_in_past if intake time has already passed since that means it can't be scheduled
        now_utc = datetime.datetime.now(pytz.utc)
        if intake_datetime_utc < now_utc:
            return "passed_time_in_past"

        
        # Calculate start and end of notification window in UTC
        start_time_utc = (intake_datetime_local - timedelta(hours=2)).astimezone(pytz.utc) 
        end_time_utc = (intake_datetime_local + timedelta(hours=2)).astimezone(pytz.utc)
        
        # The passed interval parameter decides if the function is gonna schedule notifications ahead of the intake time to prepare the user
        # to take their pill.

        # Schedule notifications 2 hours before intake every 30 minutes 
        # Increasing current_time by 30 minutes each loop until it is greater than intake_time in which case it will break the loop
        if interval == True:
            print("\n\nintake Time:\n\n", intake_time)
            current_time_utc = start_time_utc
            while current_time_utc < intake_datetime_utc:
                scheduler.add_job(
                    func=send_notification,
                    trigger="date",
                    run_date=current_time_utc,
                    args=[
                        fcm_token,
                        "Your Pill time is coming up!",
                        f"It's {format_time(intake_datetime_local, current_time_utc.astimezone(user_timezone))} before your Intake time. Take your Pill!"
                    ],
                    id=f"{fcm_token}_{current_time_utc.isoformat()}"
                )
                current_time_utc += timedelta(minutes=30)
        
        # After intake time, schedule notifications every 15 minutes until 2 hours after
        current_time_utc = intake_datetime_utc
        while current_time_utc <= end_time_utc:
            scheduler.add_job(
                func=send_notification,
                trigger="date",
                run_date=current_time_utc,
                args=[
                    fcm_token,
                    "Your intake Time passed!",
                    f"It's {format_time(intake_datetime_local, current_time_utc.astimezone(user_timezone))} PAST your Intake time. Take your Pill QUICKLY!"
                ],
                id=f"{fcm_token}_{current_time_utc.isoformat()}"
            )
            current_time_utc += timedelta(minutes=15)

        print(f"Scheduled notifications for {fcm_token}\n")
        for job in scheduler.get_jobs():
            print(f"{job}: {job.next_run_time}")
    else:
        return f"User by fcm token {fcm_token} not found"

# To check if it is a pill day or not we take the total length of the cycle and use modulus arithmetic to 
# calculate the current position within the recurring cycle.
# Since the cycle always starts with the pill days we now just have to check if day in cycle is smaller than or equal to
# our pill days. If it is that means we aren't past the pill days yet and we can return true.
@app.route("/is-pill-day", methods=["POST"])
def is_pill_day(pill_days=None, break_days=None, start_date_str=None, current_date=None):
    if current_date is None:
        current_date = datetime.date.today()
    # Check if function is being called from endpoint if it is retrieve values to calculate pill day from database
    if has_request_context():
        data = request.get_json()
        fcm_token = data.get("fcmToken")
        
        if fcm_token:
            user = User.query.filter_by(fcm_token=fcm_token).first()

            if user:
                pill_days = user.pill_days
                break_days = user.break_days
                start_date_str = user.start_date

            else:
                return jsonify({"error:" "user not found in database"}), 404
        else:
            return jsonify({"error": "fcmToken is required"}), 400



    start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
    days_since_start = (current_date-start_date).days
    cycle_length = pill_days + break_days
    day_in_cycle = days_since_start % cycle_length
    
    if has_request_context():
        return jsonify({"isPillDay": day_in_cycle < pill_days})
    else:
        return day_in_cycle < pill_days



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
        
        user.is_pill_taken = False # Set is_pill_taken to false for all users at 12pm since a new day starts

        pill_day = is_pill_day(pill_days, break_days, start_date_str=start_date)

        if pill_day:
            schedule_notifications(intake_time=intake_time, fcm_token=fcm_token, interval=True)
            pill_day_count += 1

    db.session.commit()
    print(f"Finished scheduling user notifications. {User.query.count()} total users of which {pill_day_count} had their pill day")

# Function to set up notifications when a user first registers or changes intake time for the day
# Essentially does the same thing as reset_day_all but only to a given user instead of looping through the whole DB
@app.route("/schedule-notifications", methods=["POST"])
def reset_day_individual():
    data = request.get_json()
    fcm_token = data.get("fcmToken")
    intake_time = data.get("intakeTime")
    interval = data.get("interval")
    if fcm_token:
        user = User.query.filter_by(fcm_token=fcm_token).first()
        if user:
            pill_day = is_pill_day(pill_days=user.pill_days, break_days=user.break_days, start_date_str=user.start_date)
            if pill_day:
                if "interval" in data:
                    try:
                        interval = str_to_bool(interval)
                    except ValueError as e:
                        return jsonify({"error": str(e)}), 400
                    # Check if intake time is given in ther request which means that the temporary intake time got changed and is being passed in the request.
                    # If it is not given, the endpoint is likely called following initial registration in which case we'll just get the intake time from DB
                    if intake_time:
                        schedule_notifications_reponse = schedule_notifications(intake_time=intake_time, fcm_token=fcm_token, interval=interval)
                        # We want to return an error if schedule_notifications returns that the passed time is in the past
                        if schedule_notifications_reponse == "passed_time_in_past":
                            return jsonify({"error": "passed intake time is in the past"}), 400
                    else:
                        schedule_notifications(intake_time=user.intake_time, fcm_token=fcm_token, interval=interval)
                    return jsonify({"message": "Succesfully scheduled notifications"})
                else:
                    return jsonify({"error": "interval required"}), 400
        else:
            return jsonify({"error": f"Could not find User: {fcm_token}"}), 404
    else:
        return jsonify({"error": "fcmToken is required"}), 400

@app.route("/pill-taken", methods=["POST", "GET"])
def pill_taken():
    if request.method == "POST":
        data = request.get_json()
        fcm_token = data.get("fcmToken")
        is_pill_taken = data.get("isPillTaken")
        user = User.query.filter_by(fcm_token=fcm_token).first()
        if not fcm_token:
            return jsonify({"error": "fcmToken is required"}), 400
        
        if user:
            if "isPillTaken" in data:
                # update database
                user.is_pill_taken = is_pill_taken
                intake_time = user.intake_time
                db.session.commit()
            else:
                return jsonify({"error": "is_pill_taken required"}), 400
        else:
            return jsonify({"error": f"Could not find user {fcm_token}"}), 404

        # Check if the database value was just set to true or to false
        if user.is_pill_taken == True:
            # Cancel all existing notifications for the user with the given fcm_token if is_pill_taken was set to true since that means the user took their pill
            cancel_existing_notifications(fcm_token)
            message = "Notifications canceled for pill intake, database updated!"
            print(scheduler.get_jobs())
        elif user.is_pill_taken == False:
            # Schedule new notifications for the user with the given fcm_token if is_pill_taken was set to false since that means the user did not take their pill
            schedule_notifications(intake_time=intake_time, fcm_token=fcm_token, interval=True)
            message = "Notifications scheduled for pill intake, database updated!"

        print(f"Updated is_pill_taken to {user.is_pill_taken}")
        return jsonify({"message": message}), 200
    
    elif request.method == "GET":
        fcm_token = request.args.get("fcmToken")

        if fcm_token:
            user = User.query.filter_by(fcm_token=fcm_token).first()

            if user:
                is_pill_taken = user.is_pill_taken
                return jsonify({"pillTaken": is_pill_taken})
            else:
                return jsonify({"error": "Could not find user in Database"}), 404
        else:
            return jsonify({"error": "fcmToken query parameter is required"}), 400

@app.route("/next-notification", methods=["GET"])
def return_next_notification():
    fcm_token = request.args.get("fcmToken")

    if fcm_token:
        user = User.query.filter_by(fcm_token=fcm_token).first()
        if user:
            # find all scheduled notifications for the user
            user_jobs = [job for job in scheduler.get_jobs() if job.id.startswith(fcm_token)]
            if user_jobs:
                # Get the next run times for the jobs that are scheduled in the future
                now_utc = datetime.datetime.now(pytz.utc)
                next_run_times = [job.next_run_time for job in user_jobs if job.next_run_time > now_utc]
                if next_run_times:
                    # Get the earliest next run time
                        next_notification_time_utc = min(next_run_times)
                        # Convert to user's time zone
                        user_timezone = pytz.timezone(user.timezone)
                        next_notification_time_local = next_notification_time_utc.astimezone(user_timezone)
                        # Return in users local time zone
                        next_notification_time_str = next_notification_time_local.strftime('%H:%M')
                        return jsonify({"next_notification": next_notification_time_str})
                else:
                    return jsonify({"next_notification": None, "message": "No future notifications scheduled"})
            else:
                return jsonify({"next_notification": None, "message": "No notifications scheduled for this user"})
        else:
            return jsonify({"error": "Could not find user in Database"}), 404
    else:
        return jsonify({"error": "fcmToken query parameter is required"}), 400

if __name__ == "__main__":
    create_database(app)
    scheduler.start() 
    app.run(debug=True)
    