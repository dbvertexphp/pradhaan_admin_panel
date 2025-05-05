import { Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFirebase } from "../context/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FcGoogle, FcPhone } from 'react-icons/fc';
import { useCookies } from "react-cookie";

const Login = () => {
    const navigate = useNavigate();
    const [cookies, setCookies] = useCookies(["adminId"]);
    const { auth, firestore } = useFirebase();

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            // Get user profile from Firestore
            const userDoc = await getDoc(doc(firestore, 'users', result.user.uid));
            const userData = userDoc.data();

            // Check if the user is an admin
            // const isAdmin = userData?.is_admin || false;
            const isAdmin = true;

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
            console.error('Error signing in with Google:', error.message);
        }
    };

    return (
        <div className="h-screen w-screen flex justify-center items-center bg-gray-100">
            {/* Your component content */}
            <button
                onClick={signInWithGoogle}
                className="bg-primary-blue text-white py-2 px-4 mr-8 rounded-md hover: focus:outline-none focus:ring focus:border-blue-300 flex items-center  transition-transform duration-300 ease-in-out transform hover:scale-110"
            >
                <FcGoogle className="mr-2" /> Sign In with Google
            </button>

            {/* Phone Auth Button */}
            <button
                onClick={() => navigate('/phone-verification')}
                className="bg-primary-blue text-white py-2 px-4 mr-8 rounded-md hover: focus:outline-none focus:ring focus:border-blue-300 flex items-center  transition-transform duration-300 ease-in-out transform hover:scale-110"

            >
                <FcPhone className="mr-2" />   Sign In with Phone
           </button>
        </div>
    );
};
export default Login
