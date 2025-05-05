import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";
import { useParams } from "react-router-dom";

const AddRide = () => {
  const { addRideDetails, getAutoById } = useFirebase();
  const [loading, setLoading] = useState(false);
  const { autoId } = useParams();
  const [amount, setAmount] = useState("");
  const [distance, setDistance] = useState("");
  const [datetime, setDatetime] = useState("");
  const [autoData, setAutoData] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Get current date and time
    const now = new Date();
    const formattedDatetime = now.toISOString().slice(0, 16);
    setDatetime(formattedDatetime);

    const fetchAuto = async (autoId) => {
      setLoading(true);
      try {
        const data = await getAutoById(autoId);
        console.log(data);
        setAutoData(data);
      } catch (error) {
        console.error("Error fetching auto data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuto(autoId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateObject = new Date(datetime);

    const rideData = {
      amount: parseInt(amount, 10),
      datetime: dateObject,
      distance: parseInt(distance, 10),
      location: autoData.location,
      from: autoData.from,
      to: autoData.to,
      autoid: autoId,
    };
    try {
      const rideId = await addRideDetails(rideData);
      console.log(`New ride added with ID: ${rideId}`);
      setSuccessMessage("Ride added successfully");
      resetForm();
    } catch (error) {
      console.error("Error adding ride details:", error);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDistance("");
    setDatetime(new Date().toISOString().slice(0, 16));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <div className="p-4" style={{ width: "50%", margin: "auto" }}>
              <h2 className="text-2xl font-bold mb-4 text-center">Add Ride</h2>
              {successMessage && (
                <div className="bg-green-200 text-green-800 p-2 mb-4 rounded">
                  {successMessage}
                </div>
              )}
              <form
                onSubmit={handleSubmit}
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
              >
                <div className="mb-4">
                  <label
                    htmlFor="amount"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Amount"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="Kilometer"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Kilometer
                  </label>
                  <input
                    id="Kilometer"
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Kilometer"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="datetime"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Date and Time
                  </label>
                  <input
                    id="datetime"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddRide;
