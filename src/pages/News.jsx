import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import Navbar from "../components/navbar/Navbar"
import Sidebar from "../components/sidebar/Sidebar"

// Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable, uploadString } from 'firebase/storage';
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { useFirebase } from "../context/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries



const News = () => {
    const storage = getStorage();
    const navigate = useNavigate();
    const { firestore, auth } = useFirebase();
    const [cookies, setCookies] = useCookies(["adminId"]);

    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');

    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState('1-India');
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const [file, setFile] = useState(null); // For video/photo file
    const [loading, setLoading] = useState(false);
    const [contentFormat, setContentFormat] = useState('photo');
    const [isAdmin, setIsAdmin] = useState(null);


    if (file) console.log(file, "filesdf")

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };


//     useEffect(() => {
//         if (cookies.adminId === undefined) {
//             toast.error("Please Login")
//             navigate('/login')
//         }
//     }, [])

//     useEffect(() => {
//         const fetchAdminData = async () => {
//             try {
//                 const adminId = cookies.adminId;
//                 console.log(adminId, "dsfjhkjsdf")
//                 if (adminId) {
//                     const userDoc = await getDoc(doc(firestore, 'users', adminId));
//                     const userData = userDoc.data();
//                     const isAdmin = userData?.is_admin || false;
//                     setIsAdmin(isAdmin);
//                 } else {
//                     toast.error("Please Login")
//                     navigate('/login');
//                 }
//             } catch (error) {
//                 console.error('Error fetching admin data:', error.message);
//             }
//         };

//         fetchAdminData();
//     }, [cookies.adminId, firestore]);

//     useEffect(() => {
//         if (isAdmin === false) {
//             toast.error("Please Login");
//             navigate('/login');
//         }
//     }, [isAdmin]);



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

        // if (selectedCountry) {
        fetchStates();
        // }
    }, [firestore, selectedCountry]);


    // Fetch cities based on the selected state
    useEffect(() => {
        const fetchCities = async () => {
            4
            const citiesCollection = collection(firestore, 'location', selectedCountry, 'State', selectedState, 'city');
            const citiesSnapshot = await getDocs(citiesCollection);
            setCities(citiesSnapshot.docs.map((doc) => doc.id));
        };

        if (selectedState) {
            fetchCities();
        }
    }, [firestore, selectedState]);



    const uploadFile = async (file, isImage) => {
        try {
            setLoading(true);

            // Generate a unique filename based on the current timestamp and file type
            const timestamp = Date.now();
            const fileExtension = isImage ? (file.type.includes('png') ? 'png' : 'jpg') : 'mp4';
            const filename = `${timestamp}.${fileExtension}`;

            const storageRef = ref(storage, `news/videos_photos/${filename}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            // Get a promise to indicate the completion of the upload
            const uploadPromise = new Promise((resolve, reject) => {
                uploadTask.on('state_changed', null, reject, () => {
                    resolve();
                });
            });

            await uploadPromise;

            const downloadURL = await getDownloadURL(storageRef);

            setLoading(false);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            setLoading(false);
            throw error;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!file) {
                // Handle the case where no file is selected
                toast.error('No file selected.');
                return;
            }

            const isImage = file.type.includes('image');
            const downloadURL = await uploadFile(file, isImage);

            // Add document to Firestore
            const newsData = {
                state: selectedState,
                district: selectedCity,
                content_format: contentFormat,
                videoOrPhoto: downloadURL,
                creationTime: serverTimestamp(),
            };

            await addDoc(collection(firestore, 'news'), newsData);

            console.log('News added successfully!');
            toast.success('News added successfully!');
            // Clear input fields
            setSelectedState('');
            setSelectedCity('');
            setFile(null);
        } catch (error) {
            console.error('Error adding news:', error);
        }
    };

    return (
        <div>
            <div className='flex h-screen overflow-hidden'>
                <Sidebar />
                <div className='relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
                    <main>
                        <div className='bg-gray-100'>
                            <Navbar />
                            {/* <p className="text-center">News</p> */}
                            <form className="flex items-center justify-center w-screen h-screen" onSubmit={handleSubmit}>
                                <div className="">

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


                                    <label className="block text-gray-700 my-4 text-sm font-bold mb-2">
                                        Video/Photo:
                                        <input
                                            type="file"
                                            accept="image/*, video/*"
                                            onChange={handleFileChange}
                                            className="mt-1 p-2 border ml-4 border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                                        />
                                    </label>
                                    {/* <FormGroup row>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={contentFormat === 'photo'}
                                                    onChange={() => setContentFormat('photo')}
                                                />
                                            }
                                            label="Photo"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={contentFormat === 'video'}
                                                    onChange={() => setContentFormat('video')}
                                                />
                                            }
                                            label="Video"
                                        />
                                    </FormGroup> */}


                                    <button className="px-3 text-white my-4 font-medium justify-center w-full bg-primary-blue rounded-lg py-3 flex space-x-2 items-center transition transform active:scale-95 duration-200" type="submit" disabled={loading}>
                                        {loading ? 'Adding News...' : 'Add News'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
export default News
