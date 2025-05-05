// Import necessary modules from Firebase
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useFirebase } from "../context/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";

const PhoneVerification = () => {
    const navigate = useNavigate();
    const [selectedCountryCode, setSelectedCountryCode] = useState('+91');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cookies, setCookies] = useCookies(["adminId"]);
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [error, setError] = useState(null);
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [isVerifyingCode, setIsVerifyingCode] = useState(false);

    const recaptchaVerifier = useRef(null);

    const { auth, firestore } = useFirebase()
    useEffect(() => {
      recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }, []);

    // const handleSendCode = async () => {
    //     try {
    //         //   const auth = getAuth();

    //         // Send verification code to the user's phone
    //         const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current);

    //         // Save the confirmation result for later use
    //         setConfirmationResult(confirmation);

    //         // Update state to indicate that the code has been sent
    //         setIsCodeSent(true);
    //     } catch (error) {
    //         console.error('Error sending verification code:', error.message);
    //         setError(error.message);
    //     }
    // };

    // const handleVerifyCode = async () => {
    //     try {
    //         // Confirm the verification code
    //         await confirmationResult.confirm(verificationCode);

    //         // Code verification successful, handle further actions (e.g., sign in the user)
    //         console.log('Phone number verified successfully!');
    //     } catch (error) {
    //         console.error('Error verifying code:', error.message);
    //         setError(error.message);
    //     }
    // };


    const handleSendCode = async () => {
        try {
            setIsSendingCode(true); // Set loading state
            // const auth = getAuth();
            // Combine country code with phone number
            const fullPhoneNumber = `${selectedCountryCode}${phoneNumber}`;

            console.log(fullPhoneNumber, "dfhjkdfhjkdfhkj");

            const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifier.current);
            setConfirmationResult(confirmation);
            setIsCodeSent(true);
        } catch (error) {
            console.error('Error sending verification code:', error.message);
            setError(error.message);
        } finally {
            setIsSendingCode(false); // Reset loading state
        }
    };
    const handleVerifyCode = async () => {
        try {
            setIsVerifyingCode(true); // Set loading state
            // Confirm the verification code
            await confirmationResult.confirm(verificationCode);

            // Get user profile from Firestore
            // const auth = getAuth();
            const user = auth.currentUser;

            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(firestore, 'users', user.uid));
            const userData = userDoc.data();

            console.log(userData);


            // Check if the user is an admin
            const isAdmin = userData?.is_admin || false;

            if (isAdmin) {
                // Redirect to the desired page (e.g., "/")
                setCookies("adminId", userData?.id);
                localStorage.setItem("isAdmin", true);
                toast.success("Admin signed in successfully");
                navigate('/');
            } else {
                // Handle case where the user is not an admin
                toast.error("User is not an admin");
            }

        } catch (error) {
            console.error('Error verifying code:', error.message);
            setError(error.message);
        } finally {
            setIsVerifyingCode(false); // Reset loading state
        }
    };


    return (
        <div className="flex flex-col items-center justify-center mt-8">
            <div id="recaptcha-container" className="mb-4"></div>

            {!isCodeSent ? (
                <>
                    <label className="mb-2">Enter your phone number:</label>
                    <div className="flex mb-4">
                        <div className="relative">
                            <select
                                value={selectedCountryCode}
                                onChange={(e) => setSelectedCountryCode(e.target.value)}
                                className="p-2 pl-4 pr-8 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="+91">+91</option>
                                {/* Add more country codes as needed */}
                            </select>
                        </div>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="p-2 border border-gray-300 rounded-r focus:outline-none focus:border-blue-500 flex-grow"
                        />
                    </div>

                    <button
                        onClick={handleSendCode}
                        disabled={isSendingCode} // Disable button while sending code
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
                    >
                        {isSendingCode ? <CircularProgress className="text-3xl" /> : "Send Verification Code"}
                    </button>
                </>
            ) : (
                <>
                    <label className="mb-2">Enter the verification code sent to your phone:</label>
                    <input
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleVerifyCode}
                        disabled={isVerifyingCode} // Disable button while verifying code
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue active:bg-blue-800"
                    >
                        {isVerifyingCode ? <CircularProgress className="text-3xl" /> : "Verify Code"}
                    </button>
                </>
            )}

            {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

    );
};

export default PhoneVerification;
