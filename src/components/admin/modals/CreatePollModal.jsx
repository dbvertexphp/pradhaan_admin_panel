import { CircularProgress, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import InputField from '../../InputField';
import { useFirebase } from '../../../context/firebase';
import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';



const CreatePollModal = ({ buttonText, modalTitle, isPollAdded }) => {
    // const instance = useAxios();
    const navigate = useNavigate()
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cookies, setCookies] = useCookies(["adminId"]);
    const [formErrors, setFormErrors] = useState({});
    const [couponData, setCouponData] = useState({
        // name: '',
        // expiry: date,
        // coupontype: '',
        coupon: "",
        // percentage: discountPercentage,
        amount: '',
        limit: '',
        // maxUsePerCustomer: '',
        description: '',
    });

    const { firestore } = useFirebase();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [postalCodes, setPostalCodes] = useState([]);

    const [selectedCountry, setSelectedCountry] = useState('1-India');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedPostalCode, setSelectedPostalCode] = useState('');
    const [status, setStatus] = useState('active');


    const handleOptionChange = (index, value) => {
        const updatedOptions = [...options];
        updatedOptions[index] = value;
        setOptions(updatedOptions);
    };


    // Fetch countries (assuming India is the only country)
    useEffect(() => {
        const fetchCountries = async () => {
            setCountries(['India']);
        };

        fetchCountries();
    }, []);


    // Fetch states based on the selected country
    useEffect(() => {
        const fetchStates = async () => {
            const statesCollection = collection(firestore, 'location', selectedCountry, 'State');
            const statesSnapshot = await getDocs(statesCollection);
            setStates(statesSnapshot.docs.map((doc) => doc.id));
        };

        if (selectedCountry) {
            fetchStates();
        }
    }, [firestore, selectedCountry]);



    // Fetch cities based on the selected state
    useEffect(() => {
        const fetchCities = async () => {
            const citiesCollection = collection(firestore, 'location', selectedCountry, 'State', selectedState, 'city');
            const citiesSnapshot = await getDocs(citiesCollection);
            setCities(citiesSnapshot.docs.map((doc) => doc.id));
        };

        if (selectedState) {
            fetchCities();
        }
    }, [firestore, selectedCountry, selectedState]);


    // Fetch postal codes based on the selected city
    useEffect(() => {
        const fetchPostalCodes = async () => {
            const postalCodesCollection = collection(
                firestore,
                'location',
                selectedCountry,
                'State',
                selectedState,
                'city',
                selectedCity,
                'postal'
            );
            const postalCodesSnapshot = await getDocs(postalCodesCollection);
            setPostalCodes(postalCodesSnapshot.docs.map((doc) => doc.id));
        };

        if (selectedCity) {
            fetchPostalCodes();
        }
    }, [firestore, selectedCountry, selectedState, selectedCity]);







    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();

    //     const pollData = {
    //         question,
    //         options: options.map((text) => ({ text, count: 0 })),
    //         selectedCountry,
    //         selectedState,
    //         selectedCity,
    //         selectedPostalCode,
    //         status,
    //     };
    //     console.log(pollData, "dlkfjsdkljfklsjfdlsl")
    //     try {
    //         setLoading(true);
    //         const docRef = await addDoc(collection(firestore, 'polls'), pollData);
    //         console.log('Poll added with ID: ', docRef.id);
    //         setLoading(false);
    //         toast.success('Poll added successfully');
    //         setOpen(false);
    //     } catch (error) {
    //         console.error('Error adding poll: ', error);
    //         setLoading(false);
    //     }
    // };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Generate a new document reference with a unique ID
        const newPollRef = doc(collection(firestore, 'polls'));

        const pollData = {
            question,
            // options: options.map((text) => ({ text, count: 0 })),
            options: options.map((text) => ({ id: uuidv4(), text, count: 0 })),
            country: selectedCountry,
            state: selectedState,
            city: selectedCity,
            postal: selectedPostalCode,
            status,
            poll_id: newPollRef.id,
            created_by: cookies.adminId,
            created_at: new Date()
        };

        console.log(pollData, "pooooooooooo");

        try {
            setLoading(true);
            await setDoc(newPollRef, pollData); // Use setDoc instead of addDoc to specify the document reference
            console.log('Poll added with ID: ', newPollRef.id);
            isPollAdded(true)
            setLoading(false);
            toast.success('Poll added successfully');
            setOpen(false);
        } catch (error) {
            console.error('Error adding poll: ', error);
            setLoading(false);
        }
    };



    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        overflowY: "auto",
        maxHeight: 650,
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'white', // Changed background color to white
        boxShadow: 24,
        p: 4, // Adjust padding as needed
        // borderRadius: 4, // Add border radius for rounded corners
        outline: 'none', // Remove default focus outline
    };

    // MUI DropDown

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuProps = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                width: 250,
            },
        },
    };




    const validateCouponName = (value) => {
        // Add specific validation logic for product name
        const regex = /^[a-zA-Z ]+$/; // Only allow letters and spaces
        return regex.test(value) ? null : 'Invalid characters in coupon name';
    };
    const validateDescription = (value) => {
        // Add specific validation logic for product name
        const regex = /^[a-zA-Z ]+$/; // Only allow letters and spaces
        return regex.test(value) ? null : 'Invalid characters in description';
    };
    const validateState = (value) => {
        // Add specific validation logic for product name
        const regex = /^[a-zA-Z ]+$/; // Only allow letters and spaces
        return regex.test(value) ? null : 'Invalid characters in state';
    };
    const ValidateCity = (value) => {
        // Add specific validation logic for product name
        const regex = /^[a-zA-Z ]+$/; // Only allow letters and spaces
        return regex.test(value) ? null : 'Invalid characters in city';
    };


    const validateEmail = (value) => {
        // Basic email validation regex
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

        // Add specific validation logic for product name
        return emailRegex.test(value) ? null : 'Invalid email address';
    };

    // Numeric Regex Logic
    const validateDiscountAmount = (value) => {
        const floatValue = parseFloat(value);

        // Add specific validation logic for discount amount
        if (isNaN(floatValue) || floatValue <= 0) {
            return 'Invalid discount amount';
        }

        // Regular expression to allow only digits and optionally a decimal point
        const validInputRegex = /^\d+(\.\d{1,2})?$/;

        if (!validInputRegex.test(value)) {
            return 'Invalid characters in discount amount';
        }

        return null;
    };
    const validateLimit = (value) => {
        const floatValue = parseFloat(value);

        // Add specific validation logic for discount amount
        if (isNaN(floatValue) || floatValue <= 0) {
            return 'Invalid limit';
        }

        // Regular expression to allow only digits and optionally a decimal point
        const validInputRegex = /^\d+(\.\d{1,2})?$/;

        if (!validInputRegex.test(value)) {
            return 'Invalid characters in limit';
        }

        return null;
    };
    const validateMaxUsers = (value) => {
        const floatValue = parseFloat(value);

        // Add specific validation logic for discount amount
        if (isNaN(floatValue) || floatValue <= 0) {
            return 'Invalid max users count';
        }

        // Regular expression to allow only digits and optionally a decimal point
        const validInputRegex = /^\d+(\.\d{1,2})?$/;

        if (!validInputRegex.test(value)) {
            return 'Invalid characters in max users count';
        }

        return null;
    };




    return (
        <>
            {/* <p></p> */}
            <Button sx={{
                color: "white", borderRadius: "10px", padding: "7px 15px", backgroundColor: "#a64143",
                "&:hover": {
                    backgroundColor: '#bf6565'
                },
            }} className="px-3 text-white font-medium justify-center w-full bg-primary-blue rounded-lg py-3 flex space-x-2 items-center transition transform active:scale-95 duration-200" onClick={handleOpen}>{buttonText}</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h5" component="h2">
                        {modalTitle}
                    </Typography>
                    <Typography sx={{ my: 1, color: "gray" }} id="modal-modal-title" variant="p" component="p">
                        Polls Information
                    </Typography>
                    <form className='flex flex-col gap-4'>

                        {/* <label> */}
                        {/* Question: */}
                        {/* <input placeholder='Question:' type="text" value={question} onChange={(e) => setQuestion(e.target.value)} /> */}

                        <InputField
                            label="Question:"
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e)}
                        // validate={validateProductName}
                        />

                        {/* </label> */}

                        {/* <label> */}
                        {/* Options: */}
                        {options.map((option, index) => (
                            <InputField
                                key={index}
                                type="text"
                                label={`Option ${index + 1}:`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e)}
                            />
                        ))}
                        {/* </label> */}


                        <div className='flex w-full  gap-4'>
                            <div className='flex flex-col basis-1/2 gap-4'>
                                <p className='text-md font-semibold'>
                                    Status:
                                </p>
                                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        label="Status"
                                    >
                            
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">InActive</MenuItem>
                                  
                                    </Select>
                                </FormControl> */}
                            </div>
                            <div className='flex flex-col basis-1/2 gap-4'>
                                <p className='text-md font-semibold'>
                                    Country:
                                </p>
                                <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                                    {countries.map((country) => (
                                        <option key={country} value={country}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                    <InputLabel id="demo-simple-select-standard-label">Country:</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-standard-label"
                                        id="demo-simple-select-standard"
                                        value={selectedCountry}
                                        onChange={(e) => setSelectedCountry(e.target.value)}
                                        label="Status"
                                    >
                           
                                        <MenuItem value="active">Active</MenuItem>
                                        <MenuItem value="inactive">InActive</MenuItem>
                              

                                        {countries.map((country) => (
                                        <MenuItem key={country} value={country}>
                                            {country}
                                        </MenuItem>
                                    ))}
                                    </Select>
                                </FormControl> */}

                        </div>

                        <div className='flex w-full gap-4'>
                            <div className='flex w-[260px] flex-col  gap-4'>
                                <p className='text-md font-semibold'>
                                    State:
                                </p>
                                <select value={selectedState} className='w-full' onChange={(e) => setSelectedState(e.target.value)}>
                                    <option value="">Select State</option>
                                    {states.map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex w-full flex-col basis-1/2 gap-4'>
                                <p className='text-md font-semibold'>
                                    City:
                                </p>
                                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className='flex w-full flex-col basis-1/2 gap-4'>
                            <p className='text-md font-semibold'>
                                Postal:
                            </p>
                            <select value={selectedPostalCode} onChange={(e) => setSelectedPostalCode(e.target.value)}>
                                <option value="">Select Postal Code</option>
                                {postalCodes.map((postalCode) => (
                                    <option key={postalCode} value={postalCode}>
                                        {postalCode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* <label> */}
                        {/* Status: */}
                        {/* <select value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select> */}
                        {/* </label> */}

                        {/* Country Dropdown (Static) */}
                        {/* <label>
                            Country:
                            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}>
                                {countries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </select>
                        </label> */}

                        {/* State Dropdown (Populated based on selected country) */}
                        {/* <label>
                            State:
                            <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </select>
                        </label> */}

                        {/* City Dropdown (Populated based on selected state) */}
                        {/* <label>
                            City:
                            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </label> */}

                        {/* Postal Code Dropdown (Populated based on selected city) */}
                        {/* <label>
                            Postal Code:
                            <select value={selectedPostalCode} onChange={(e) => setSelectedPostalCode(e.target.value)}>
                                <option value="">Select Postal Code</option>
                                {postalCodes.map((postalCode) => (
                                    <option key={postalCode} value={postalCode}>
                                        {postalCode}
                                    </option>
                                ))}
                            </select>
                        </label> */}

                        {/* Add margin-top to separate form fields and button */}

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, mt: 3 }}>
                            {/* <Button
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    marginTop: 2,
                                    backgroundColor: 'white',
                                    flexBasis: "45%",
                                    color: '#04a7ff',
                                    borderRadius: "15px",
                                    border: "2px solid blue",
                                    padding: "15px 0" // Set the text color
                                }}
                                className="bg-[#04a7ff] text-white"
                            >
                                Cancle
                            </Button> */}
                            {loading ? <CircularProgress /> : Object.values(formErrors).some((error) => Boolean(error)) ? null : (<Button
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    marginTop: 2,
                                    backgroundColor: '#a64143',
                                    flexBasis: "45%",
                                    color: 'white',
                                    borderRadius: "15px",
                                    padding: "15px 0" // Set the text color
                                }}
                                className="bg-[#a64143] text-white"
                            >
                                Add
                            </Button>)}

                        </Box>

                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default CreatePollModal;
