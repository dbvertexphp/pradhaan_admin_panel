import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  FormControl,
  InputLabel,
  Box,
  MenuItem,
  LinearProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ListAuto = () => {
  const {
    getAllAuto,
    getStatesData,
    getCitiesData,
    getAutoById,
    updateAutoById,
    getPostalData,
  } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [dailyRides, setDailyRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [postalData, setPostalData] = useState([]);
  const [country, setCountry] = useState("");
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState("");

  // Modal and form state
  const [open, setOpen] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [formValues, setFormValues] = useState({
    location: "",
    amount: "",
    link: "",
    from: "",
    to: "",
    datetime: "",
  });

  const fetchRides = async () => {
      setLoading(true); // Start loading
      setProgress(25);
      try {
          const data = await getAllAuto(); // Pass cityIds as an array
          console.log("Fetched Rides:", data);

          // Sort the data based on the 'datetime' field in descending order
          const sortedData = data.sort((a, b) => {
              const dateA = new Date(a.datetime.seconds * 1000); // Convert to JavaScript Date
              const dateB = new Date(b.datetime.seconds * 1000); // Convert to JavaScript Date
              return dateB - dateA; // Sort in descending order (newest to oldest)
          });

          setDailyRides(sortedData); // Set the sorted data to the state
          setFilteredRides(sortedData); // Initially, show all rides
      } catch (error) {
          console.error("Error fetching rides data:", error);
      } finally {
          setLoading(false); // End loading
          setProgress(0);
      }
  };


  const fetchStates = async () => {
    try {
      const data = await getStatesData();
      setStates(data); // Set the fetched states data to the state variable
    } catch (error) {
      console.error("Error fetching states data:", error);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchRides();
  }, []);

  const handleEditClick = async (rideId) => {
    setLoading(true);
    try {
      const rideData = await getAutoById(rideId);
      setCurrentRide(rideId);
      const dateObject = new Date();
      setFormValues({
        location: rideData.location || "",
        amount: rideData.amount || "",
        link: rideData.link || "",
        from: rideData.from || "",
        to: rideData.to || "",
        datetime: dateObject,
      });
      setOpen(true);
    } catch (error) {
      console.error("Error fetching ride data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    try {
      await updateAutoById(currentRide, formValues);
      setOpen(false);
      fetchRides();
      setSuccessMessage("Auto update successfully");
      // Optionally, refresh data to see changes
    } catch (error) {
      console.error("Error updating ride:", error);
    }
  };

  const formatDatetime = (datetime) => {
    if (!datetime || !datetime.seconds) {
      return "N/A"; // Return a fallback text if datetime is null or undefined
    }

    const date = new Date(datetime.seconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // This will return a human-readable date and time
  };

  const handleStateChange = async (selectedStateId) => {
    setState(selectedStateId); // Update selected state
    setCity(""); // Reset city when state changes
    setCountry("");
    const citiesData = await getCitiesData(selectedStateId); // Fetch cities for selected state
    setCities(citiesData); // Set the fetched cities data
    filterRides(country, selectedStateId, "", ""); // Reapply the filter
  };

  const handleCityChange = async (selectedCityId) => {
    setCity(selectedCityId); // Update selected city
    const postalData = await getPostalData(state, selectedCityId);
    setPostalData(postalData);
    filterRides(country, state, selectedCityId, ""); // Reapply the filter when city changes
  };

  const handlePostalChange = async (selectedPostalId) => {
    setPostal(selectedPostalId);
    filterRides(country, state, city, selectedPostalId);
  };

  const handleCountryChange = (selectedCountryId) => {
    setCountry(selectedCountryId); // Update selected country
    setState(""); // Reset state when country changes
    setCity(""); // Reset city when country changes
    setPostal("");
    filterRides(selectedCountryId, "", "", ""); // Reset the filter and show all rides in selected country
  };

  const filterRides = (country, state, city, postal) => {
      let filtered = dailyRides;

      console.log(postal);

      // If country and state are selected, apply filter based on state only
      if (country && state && !city && !postal) {
          filtered = filtered.filter((ride) => ride.location.includes(state));
      }
      // If country is selected and no state or city, filter based on country
      else if (country && !state && !city && !postal) {
          filtered = filtered.filter((ride) => ride.location.includes(country));
      }
      // If both state and city are selected, filter by city first
      else if (state && city && !postal) {
          filtered = filtered.filter((ride) => ride.location.includes(city));
      }
      // If only state is selected (no city), filter by state
      else if (state && !city && !postal) {
          filtered = filtered.filter((ride) => ride.location.includes(state));
      }
      // If both state, city, and postal are selected, filter by postal code
      else if (state && city && postal) {
          filtered = filtered.filter((ride) => ride.location.includes(postal));
      }
      // If only city is selected (no state), filter by city
      else if (city && !state && !postal) {
          filtered = filtered.filter((ride) => ride.location.includes(city));
      }
      // If postal code is selected but no other criteria, filter by postal
      else if (postal && !state && !city) {
          filtered = filtered.filter((ride) => ride.location.includes(postal));
      }

      setFilteredRides(filtered); // Update the filtered rides state
  };


  // Function to reset filters and show all data
  const resetFilters = () => {
    setCountry("");
    setState("");
    setCity("");
    setPostal("");
    setFilteredRides(dailyRides); // Reset to show all data
  };

  const handleAddRideClick = (autoId) => {
    navigate(`/add-ride/${autoId}`); // Replace "/add-ride" with the actual path you want to navigate to
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <div className="p-4" style={{ width: "80%", margin: "auto" }}>
              <h2 className="text-2xl font-bold mb-4 text-center">List Auto</h2>
              <Box>
                <FormControl
                  style={{
                    width: "300px", // You can adjust the width as needed
                    margin: "20px",
                    height: "56px", // Adjust the height to match your desired size
                  }}
                >
                  <InputLabel id="demo-simple-select-label">Country</InputLabel>
                  <Select
                    id="country"
                    labelId="demo-simple-select-label"
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    style={{
                      height: "100%", // Ensures the Select matches the height of the FormControl
                    }}
                  >
                    <MenuItem value="">Select a country</MenuItem>
                    <MenuItem value="India">India</MenuItem>
                  </Select>
                </FormControl>

                <FormControl
                  style={{
                    width: "200px",
                    margin: "20px",
                    marginBottom: "40px",
                    height: "56px", // Adjust the height as needed
                  }}
                >
                  <InputLabel id="demo-simple-select-label">State</InputLabel>
                  <Select
                    id="state"
                    labelId="demo-simple-select-label"
                    value={state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    style={{
                      height: "100%", // Ensures the Select matches the height of the FormControl
                    }}
                  >
                    <MenuItem value="">Select a state</MenuItem>
                    {states.map((stateData) => (
                      <MenuItem key={stateData.id} value={stateData.id}>
                        {stateData.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  style={{
                    width: "200px",
                    margin: "20px",
                    height: "56px", // Adjust the height as needed
                  }}
                >
                  <InputLabel id="demo-simple-select-label-city">
                    City
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label-city"
                    id="demo-simple-select-city"
                    value={city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    style={{
                      height: "100%", // Ensures the Select matches the height of the FormControl
                    }}
                  >
                    <MenuItem value="">Select a city</MenuItem>
                    {cities.map((cityData) => (
                      <MenuItem key={cityData.id} value={cityData.id}>
                        {cityData.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl
                  style={{
                    width: "200px",
                    margin: "20px",
                    height: "56px", // Adjust the height as needed
                  }}
                >
                  <InputLabel id="demo-simple-select-label-postal">
                    Postal
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label-postal"
                    id="demo-simple-select-city"
                    value={postal}
                    onChange={(e) => handlePostalChange(e.target.value)}
                    style={{
                      height: "100%", // Ensures the Select matches the height of the FormControl
                    }}
                  >
                    <MenuItem value="">Select a postal</MenuItem>
                    {postalData.map((postal) => (
                      <MenuItem key={postal.id} value={postal.id}>
                        {postal.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={resetFilters}
                  style={{
                    marginTop: "30px",
                  }}
                >
                  Reset Filters
                </Button>
              </Box>

              {loading && (
                <LinearProgress variant="determinate" value={progress} />
              )}

              {successMessage && (
                <div className="bg-green-200 text-green-800 p-2 mb-4 rounded">
                  {successMessage}
                </div>
              )}

              {!loading && (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="rides table">
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="center">Link</TableCell>
                        <TableCell align="right">From</TableCell>
                        <TableCell align="right">To</TableCell>
                        <TableCell align="right">Date & Time</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRides.map((ride) => (
                        <TableRow key={ride.id}>
                          <TableCell>{ride.location}</TableCell>
                          <TableCell align="right">{ride.amount}</TableCell>
                          <TableCell align="center">{ride.link}</TableCell>
                          <TableCell align="right">{ride.from}</TableCell>
                          <TableCell align="right">{ride.to}</TableCell>
                          <TableCell align="right">
                            {formatDatetime(ride.datetime)}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              onClick={() => handleAddRideClick(ride.id)} // Wrap the function call in an inline function
                              sx={{ margin: "15px" }}
                            >
                              Add Ride
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => handleEditClick(ride.id)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="sm"
              >
                <DialogTitle>Edit Ride</DialogTitle>
                <DialogContent>
                  {/*<TextField
                    label="Location"
                    name="location"
                    fullWidth
                    margin="dense"
                    value={formValues.location}
                    onChange={handleFormChange}
                  />*/}
                  <TextField
                    label="Amount"
                    name="amount"
                    fullWidth
                    margin="dense"
                    value={formValues.amount}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="Link"
                    name="link"
                    fullWidth
                    margin="dense"
                    value={formValues.link}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="From"
                    name="from"
                    fullWidth
                    margin="dense"
                    value={formValues.from}
                    onChange={handleFormChange}
                  />
                  <TextField
                    label="To"
                    name="to"
                    fullWidth
                    margin="dense"
                    value={formValues.to}
                    onChange={handleFormChange}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpen(false)} color="secondary">
                    Cancel
                  </Button>
                  <Button onClick={handleFormSubmit} color="primary">
                    Save
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ListAuto;
