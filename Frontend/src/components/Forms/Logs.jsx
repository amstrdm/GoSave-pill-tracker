import { useState } from "react"
import { useEffect } from "react"
import { getFcmToken } from "../../utils/storage"
import api from "../../axiosInstance"
import { useNavigate } from "react-router-dom"

function Logs(){
    const [pillLogs, setPillLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const fcmToken = getFcmToken()

    const navigate = useNavigate()

    useEffect(() => {
        async function getPillLogs() {
            try{
                const response = await api.get("/get-logs", {
                    params:{"fcmToken": fcmToken}
                })
                setPillLogs(response.data.pillLogs)
            }catch(err){
                setError(err.message)
            }finally{
                setLoading(false)
            }
        }

        getPillLogs()
    }, [])

    return (
        <div className="relative min-h-screen p-4">
          {/* Back Button */}
          <button
            className="mb-4"
            onClick={() => {
              navigate("/");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"  
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
    
          {/* Content */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-6xl font-bold text-center mb-6">
                  Error: {error}
                </p>
              </div>
            ) : (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day of Week</th>
                    <th>Pill Day</th>
                    <th>Pill Taken</th>
                    <th>Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {pillLogs.map((log, index) => (
                    <tr
                      key={index}
                      className={
                        log.is_pill_day
                          ? log.pillTaken
                            ? "bg-green-100"
                            : "bg-red-100"
                          : "bg-gray-100"
                      }
                    >
                      <td>{log.calendar_date}</td>
                      <td>{log.day_of_week}</td>
                      <td>{log.is_pill_day ? "Yes" : "No"}</td>
                      <td>
                        {log.is_pill_day ? (log.pillTaken ? "Yes" : "No") : "N/A"}
                      </td>
                      <td>{log.pill_taken_time ? log.pill_taken_time : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      );

}

export default Logs