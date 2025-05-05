import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { storage, firebaseApp } from "../context/firebase";
import { useNavigate } from 'react-router-dom';


const AddPromoters = () => {
  const { addPromoters, getStatesData, getCitiesData, getPostalData } =
    useFirebase();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null); // Change to null to store the file object
  const [name, setName] = useState("");
  const [datetime, setDatetime] = useState(
    new Date().toISOString().slice(0, 16)
  ); // Default to current date and time
  const [totalContribution, setTotalContribution] = useState("");
  const [weeklyContribution, setWeeklyContribution] = useState("");
  const [username, setUsername] = useState("");

  const [country, setCountry] = useState("India"); // Default to India since there's only one option
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [postalData, setPostalData] = useState([]);
  const [location, setLocation] = useState("");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate()

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
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
  }, [country, state, city, postal]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      console.error("Image is required");
      return;
    }

    const dateObject = new Date(datetime);

    // Upload the image to Firebase Storage
    const imageRef = ref(storage, `users/${image.name}`); // Save in 'users' folder with image name

    try {
      // Upload the image
      const uploadTask = uploadBytesResumable(imageRef, image);

      // Wait for upload completion
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Optional: Handle progress if needed (e.g., display upload progress)
          const progressPercentage =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progressPercentage);

        },
        (error) => {
          console.error("Error uploading image: ", error);
          throw error; // Handle errors during upload
        },
        async () => {
          // Once the upload is complete, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const promoterData = {
            image: downloadURL, // Save the URL of the uploaded image
            datetime: dateObject,
            name: name,
            total_contribution: totalContribution,
            username: username,
            weekly_contribution: weeklyContribution,
            scope: location,
          };

          const contactData = {
            email: email,
            phone: phone,
          }

          // Add promoter data to Firestore
          const promoterId = await addPromoters(promoterData, contactData);
          console.log(`New Promoter added with ID: ${promoterId}`);
          setSuccessMessage("Promoter added successfully");
          resetForm();
          navigate("/promoters");
        }
      );
    } catch (error) {
      console.error("Error adding promoter:", error);
    }
  };

  const handleStateChange = async (selectedStateId) => {
    setState(selectedStateId);
    const citiesData = await getCitiesData(selectedStateId);
    setCities(citiesData);
  };

  const handleCityChange = async (selectCityId) => {
    setCity(selectCityId);
    const postalData = await getPostalData(state, selectCityId);
    setPostalData(postalData);
  };

  const resetForm = () => {
    setState("");
    setCity("");
    setLocation("");
    setEmail("");
    setPhone("");
    setImage(null);
    setName("");
    setTotalContribution("");
    setWeeklyContribution("");
    setUsername("");
    setDatetime(new Date().toISOString().slice(0, 16)); // Reset to current date and time
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <div className="p-4" style={{ width: "50%", margin: "auto" }}>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Add Promoters
              </h2>
              {successMessage && (
                <div className="bg-green-200 text-green-800 p-2 mb-4 rounded">
                  {successMessage}
                </div>
              )}

              {progress > 0 && (
                <div className="mt-4">
                  <div className="bg-gray-200 w-full h-2 rounded-full">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round(progress)}% Uploading...
                  </p>
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
                    htmlFor="name"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text" // Changed to text for username
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Name"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="name"
                    type="text" // Changed to text for username
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Email"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="text" // Changed to text for username
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Phone"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="image"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Image
                  </label>
                  <input
                    id="image"
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])} // Handle file selection
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="totalContribution"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Total Contribution
                  </label>
                  <input
                    id="totalContribution"
                    type="text" // Changed to number
                    value={totalContribution}
                    onChange={(e) => setTotalContribution(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Total Contribution"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="weeklyContribution"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Weekly Contribution
                  </label>
                  <input
                    id="weeklyContribution"
                    type="text" // Changed to number
                    value={weeklyContribution}
                    onChange={(e) => setWeeklyContribution(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Weekly Contribution"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="username"
                    className="block text-gray-700 text-sm font-bold mb-2"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text" // Changed to text for username
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Enter Username"
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

export default AddPromoters;
