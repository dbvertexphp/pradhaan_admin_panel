import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";

const AddRide = () => {
  const { getStatesData, getCitiesData, addAutoDetails, getPostalData } =
    useFirebase();
  const [loading, setLoading] = useState(false);

  const [country, setCountry] = useState("India"); // Default to India since there's only one option
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [amount, setAmount] = useState("");
  const [distance, setDistance] = useState("");
  const [datetime, setDatetime] = useState("");
  const [addLink, setAddlink] = useState("");
  const [rideTo, setRideTo] = useState("");
  const [rideFrom, setRideFrom] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalData, setPostalData] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    // Get current date and time
    const now = new Date();
    const formattedDatetime = now.toISOString().slice(0, 16);
    setDatetime(formattedDatetime);

    const fetchStates = async () => {
      setLoading(true);
      try {
        const data = await getStatesData();
        setStates(data);
        console.log(data); // Log states
      } catch (error) {
        console.error("Error fetching states Data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  // Set location based on selections
  useEffect(() => {
    let newLocation = country;

    if (state) {
      newLocation = state;
    }

    if (city) {
      newLocation = city;
    }

    if (postal) {
      newLocation = postal;
    }

    setLocation(newLocation);
  }, [country, state, city, postal]); // This will run whenever country, state, or city changes

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateObject = new Date(datetime);

    // Log the country value on form submission
    console.log("Country selected:", country);

    const rideData = {
      amount: parseInt(amount, 10),
      datetime: dateObject,
      location: location,
      link: addLink,
      to: rideTo,
      from: rideFrom,
    };
    try {
      const autoId = await addAutoDetails(rideData);
      console.log(`New auto added with ID: ${autoId}`);
      setSuccessMessage("Auto added successfully");
      resetForm();
    } catch (error) {
      console.error("Error adding auto details:", error);
    }
  };

  const handleStateChange = async (selectedStateId) => {
    setState(selectedStateId);
    const citiesData = await getCitiesData(selectedStateId);
    setCities(citiesData);
  };

  const handleCityChange = async (selectCityId) => {
    setCity(selectCityId);
    const postalData = await getPostalData(state,selectCityId);
    setPostalData(postalData);
  };

  const resetForm = () => {
    setState("");
    setCity("");
    setLocation("");
    setAmount("");
    setDistance("");
    setAddlink("");
    setRideFrom("");
    setRideTo("");
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
              <h2 className="text-2xl font-bold mb-4 text-center">Add Auto</h2>
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
                    htmlFor="country"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Select Country
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      console.log("Country changed to:", e.target.value); // Log when country changes
                    }}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="state"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Select State
                  </label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select a state</option>
                    {states.map((stateData) => (
                      <option key={stateData.id} value={stateData.id}>
                        {stateData.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="city"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Select City
                  </label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select a city</option>
                    {cities.map((cityData) => (
                      <option key={cityData.id} value={cityData.id}>
                        {cityData.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="postal"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Select Postal
                  </label>
                  <select
                    id="postal"
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Select a Postal</option>
                    {postalData.map((postal) => (
                      <option key={postal.id} value={postal.id}>
                        {postal.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    htmlFor="addLink"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Add link
                  </label>
                  <input
                    id="addLink"
                    type="string"
                    value={addLink}
                    onChange={(e) => setAddlink(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Link"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="rideTo"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    To
                  </label>
                  <input
                    id="rideTo"
                    type="string"
                    value={rideTo}
                    onChange={(e) => setRideTo(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="To"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="rideFrom"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    From
                  </label>
                  <input
                    id="rideFrom"
                    type="string"
                    value={rideFrom}
                    onChange={(e) => setRideFrom(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="To"
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
