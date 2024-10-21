import { baseURL } from "../axiosInstance";
import { getFcmToken } from "../utils/storage";

function InfoRemindHome(){


    const fcmToken = getFcmToken()

    return (
        <>
          <button
            className="btn btn-secondary mt-5"
            onClick={() => document.getElementById('remind_home_info').showModal()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m6.75 7.5 3 2.25-3 2.25m4.5
                0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21
                18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25
                2.25 0 0 0 3 6v12a2.25 2.25 0 0 0
                2.25 2.25Z"
              />
            </svg>
            Set up
          </button>
    
          <dialog id="remind_home_info" className="modal">
            <div className="modal-box">
              <p>
                Unfortunately, this app can&#39;t track your location. To help you get
                reminded to take your pills when you arrive home, you can automate location
                tracking using the iPhone Shortcuts app. <strong>Here’s a quick guide:</strong>
              </p><br />
              <ul>
                <li>
                  <p>
                    <strong>1. Create a new Focus:</strong> Go to <strong>Settings</strong> and
                    then to <strong>Focus</strong> and create a new Focus. Choose a Name then
                    go under <strong>Set a Schedule</strong> and add a new Location Schedule.
                    Enter your Home address and click Done. Now go to{' '}
                    <strong>Smart Activation</strong> and toggle it on.
                  </p>
                </li><br />
                <li>
                  <p>
                    <strong>2. Create a new Shortcut:</strong> Open the Shortcut App and go to
                    the automation tab. Click on <strong>New Automation</strong> and click on
                    your newly created Focus. Select <strong>When Turning On</strong> and{' '}
                    <strong>Run Immediately</strong>.
                  </p>
                </li><br />
                <li>
                  <p>
                    3. In the next screen, click on <strong>Blank Automation</strong> and search
                    for <strong>Get Contents of URL</strong>. Enter{' '}
                    <code>{baseURL}/remind-when-home</code> as the URL. Click on
                    the Arrow and for <strong>Method</strong> select <strong>POST</strong>.<br/><br />
                    Click on <strong>Add New Field</strong> and select <strong>Text</strong>.
                    For <strong>Key</strong> enter <code>fcmToken</code> and for{' '}
                    <strong>Text</strong> enter:<br/><br/> <code>{fcmToken}</code><br/><br/> Add another field, this
                    time select <strong>Boolean</strong>. Enter <code>waitingForHome</code>{' '}
                    for the Key and set it to <code>false</code>.<br/><br/> Lastly, add one last{' '}
                    <strong>Boolean</strong> field, set the Key to <code>isHome</code> and set
                    it to <code>true</code>. Now click Done.
                  </p><br />
                  <p>
                    <strong>That&#39;s it!</strong> Now you&#39;ll be reminded whenever you get home. To change
                    the address you want to be reminded at, just edit your Focus to your new
                    address.
                  </p>
                </li>
              </ul>
              <div className="modal-action">
                <form method="dialog">
                  {/* if there is a button in form, it will close the modal */}
                  <button className="btn">Close</button>
                </form>
              </div>
            </div>
          </dialog>
        </>
      );
}

export default InfoRemindHome