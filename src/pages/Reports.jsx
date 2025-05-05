import { useEffect, useState } from "react";
import { useFirebase } from "../context/firebase";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import ReportsCard from "../components/cards/ReportsCard";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { CircularProgress } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";


const Reports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cookies, setCookies] = useCookies(["adminId"]);
    const [reportsData, setReportsData] = useState([]);
    const [refreshReports, setRefreshReports] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null);
    const { getReportsWithPosts, firestore } = useFirebase();

    console.log(reportsData, "hhhhhh")

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reports = await getReportsWithPosts();
                console.log(reports, "uiuiui")
                setReportsData(reports);
                setLoading(false);
                console.log("Reports with posts:", reports);
            } catch (error) {
                console.error("Error fetching reports with posts:", error);
                setLoading(false);
            }
        };

        fetchReports();

        if (refreshReports) {
            fetchReports();
            setRefreshReports(false);
        }


    }, [getReportsWithPosts, refreshReports]);


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





    return (
        <div>
            <div className='flex h-screen overflow-hidden'>
                <Sidebar />
                <div className='relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
                    <main>
                        <div className='bg-gray-100'>
                            <Navbar />
                            {/* <div>
                                {loading ? <CircularProgress /> : { reportsData && reportsData.length > 0 ? <div className="flex flex-col justify-center items-center"> {reportsData.map((curElem) => (
                                    curElem.post !== null && (
                                        <ReportsCard post={curElem.post} setRefreshReports={setRefreshReports} by={curElem.by} reasonCounts={curElem.reasonCounts} reportsCount={curElem.reportsCount} reportId={curElem.id} />
                                    )
                                ))}</div> : (
                                    <div className="flex flex-col justify-center items-center w-screen h-screen bg-white">
                                        <p className="text-3xl">No reports available</p>
                                    </div>
                                )}}
                            </div> */}
                            <div>
                                {loading ? (
                                    <div className="flex  justify-center items-center w-screen h-screen bg-white">
                                        <CircularProgress size={50} />
                                    </div>

                                ) : (
                                    reportsData && reportsData.length > 0 ? (
                                        <div className="flex flex-col justify-center items-center">
                                            {reportsData.map((curElem) => (
                                                curElem.post !== null && (
                                                    <ReportsCard
                                                        post={curElem.post}
                                                        setRefreshReports={setRefreshReports}
                                                        by={curElem.by}
                                                        reasonCounts={curElem.reasonCounts}
                                                        reportsCount={curElem.reportsCount}
                                                        reportId={curElem.id}
                                                    />
                                                )
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col justify-center items-center w-screen h-screen bg-white">
                                            <p className="text-3xl">No reports available</p>
                                        </div>
                                    )
                                )}
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
export default Reports
