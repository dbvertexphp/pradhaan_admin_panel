import {
    Box,
    Card,
    CircularProgress,
    Grid,
    IconButton,
    LinearProgress,
    MenuItem,
    Select,
    Tooltip,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import CreatePollModal from "../components/admin/modals/CreatePollModal";
import { MdDeleteForever } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { toast } from "react-toastify";
import ConfirmBox, { tableStyles } from "../components/admin/shared/ConfirmDialog";
import { FaArrowDown, FaCartArrowDown } from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import { useFirebase } from "../context/firebase";
import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

const Polls = () => {
    const navigate = useNavigate();
    const [cookies, setCookies] = useCookies(["adminId"]);
    const [pollAdded, setPollAdded] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 50,
    });
    const [pagination, setPagination] = useState(
        null
    );
    const [deleteId, setDeleteId] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePollState, setDeletePollState] = useState(false);
    const [updatePollState, setUpdatePollState] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null);
    const { polls, getPolls, firestore } = useFirebase()

    // if (polls) console.log(polls, "dfs;jsdlkflk")

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                await getPolls();
            } catch (error) {
                console.error('Error fetching polls:', error);
            }
        };

        if (pollAdded) {
            fetchPolls();
            setPollAdded(false);
        }
        if (deletePollState) {
            fetchPolls();
            setDeletePollState(false)
        }
        if (updatePollState) {
            fetchPolls();
            setUpdatePollState(false)

        }


    }, [pollAdded, getPolls, deletePollState, updatePollState]);


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



    const handleChange = async (selectedStatus, pollId) => {
        console.log(selectedStatus, pollId, "dfahjkfdsakj");
        try {
            const pollDocRef = doc(firestore, 'polls', pollId);
            await updateDoc(pollDocRef, { status: selectedStatus });
            console.log(`Status updated to ${selectedStatus} for pollId ${pollId}`);
            setUpdatePollState(true)
            toast.success(`Status updated to ${selectedStatus} for pollId ${pollId}`);
        } catch (error) {
            console.error(`Error updating status: `, error);
            // Handle error or display an error toast
        }
    };


    const all_customer_columns = [
        {
            flex: 0.45,
            minWidth: 150,
            field: "question",
            headerName: "Title",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Typography variant="body1" fontWeight={500}>
                    {row?.question}
                </Typography>
            ),
        },
        {
            minWidth: 150,
            flex: 0.45,
            field: 'options',
            headerName: 'Options',
            align: 'left',
            headerAlign: 'left',
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <div style={{ display: 'flex', gap: '12px', flexDirection: "column" }}>
                    {row?.options.map((option, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ marginRight: '4px' }}>{String.fromCharCode(65 + index)}.</div>
                            <Typography variant="body1">{`${option.text} (${option.count})`}</Typography>

                        </div>
                    ))}
                </div>
            ),
        },

        {
            minWidth: 150,
            flex: 0.25,
            field: "country",
            headerName: "Country",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
        },
        {
            minWidth: 150,
            flex: 0.25,
            field: "state",
            headerName: "State",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
        },
        {
            minWidth: 150,
            flex: 0.25,
            field: "city",
            headerName: "City",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
        },
        {
            minWidth: 150,
            flex: 0.25,
            field: "postal",
            headerName: "Postal",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
        },
        {
            minWidth: 150,

            flex: 0.15,
            field: "status",
            headerName: "Status",
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Select
                    key={row?.poll_id}
                    fullWidth
                    size="small"
                    onChange={(e) => handleChange(e.target.value, row?.poll_id)}
                    value={row && row.status ? row.status.toLowerCase() : "active"}
                >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">InActive</MenuItem>
                </Select>
            ),
        },

        {
            minWidth: 150,

            field: "action",
            headerName: "ACTION",
            flex: 0.15,
            align: "left",
            headerAlign: "left",
            disableColumnMenu: true,
            renderCell: ({ row }) => (
                <Box>
                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => {
                                setDeleteId(row?.poll_id);
                                setDeleteOpen(true);
                            }}
                            color="error"
                        >
                            <MdDeleteForever />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];


    // const deletePoll = async () => {
    //     setDeleteLoading(true);
    //     const pollsCollectionName = 'polls';
    //     const pollIdToDelete = deleteId;
    //     console.log(pollIdToDelete, "pollIdToDelete")
    //     try {

    //         const pollsCollectionRef = collection(firestore, pollsCollectionName);
    //         const pollsQuerySnapshot = await getDocs(query(pollsCollectionRef, where('poll_id', '==', pollIdToDelete)));

    //         const deletePollsPromises = pollsQuerySnapshot.docs.map(async (reportDoc) => {
    //             await deleteDoc(reportDoc.ref);
    //             console.log(`Document with pollsId ${pollIdToDelete} deleted from 'polls' collection successfully.`);
    //         });
    //         // Wait for all deletions to complete
    //         await Promise.all([...deletePollsPromises]);
    //         toast.success("Poll Deleted Successfully")
    //         setDeletePollState(true)
    //         setDeleteLoading(false);
    //         setDeleteOpen(false);


    //     } catch (error) {
    //         console.error(`Error deleting documents: `, error);
    //         setDeleteLoading(false);
    //         // Handle error or display an error toast
    //     }
    // }



    const functions = getFunctions();
    const deleteDocumentRecursively = httpsCallable(functions, 'deleteDocumentRecursively');


    const deletePoll = async () => {
        setDeleteLoading(true);
        const pollsCollectionName = 'polls';
        const pollIdToDelete = deleteId;
        console.log(pollIdToDelete, "pollIdToDelete");
        try {
            const pollsCollectionRef = collection(firestore, pollsCollectionName);
            const pollsQuerySnapshot = await getDocs(query(pollsCollectionRef, where('poll_id', '==', pollIdToDelete)));

            const deletePollsPromises = pollsQuerySnapshot.docs.map(async (pollDoc) => {
                const pollDocRef = pollDoc.ref;
                // Call Cloud Function using httpsCallable
                await deleteDocumentRecursively({ documentPath: pollDocRef.path });
                console.log(`Document with pollsId ${pollIdToDelete} deleted from 'polls' collection and its subcollections successfully.`);
            });

            // Wait for all deletions to complete
            await Promise.all([...deletePollsPromises]);

            toast.success("Poll Deleted Successfully");
            setDeletePollState(true);
            setDeleteLoading(false);
            setDeleteOpen(false);

        } catch (error) {
            console.error(`Error deleting documents: `, error);
            setDeleteLoading(false);
            // Handle error or display an error toast
        }
    }

    return (
        <div>
            <div className='flex h-screen overflow-hidden'>
                <Sidebar />
                <div className='relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
                    <main>
                        <div className='bg-gray-100'>
                            <Navbar />
                            {/* <h1>Polls</h1> */}
                            <div className="flex items-center justify-end my-6 mr-8">
                                <button>
                                    <CreatePollModal
                                        buttonText="Create a Poll"
                                        modalTitle="Add a New Poll "
                                        isPollAdded={setPollAdded}
                                    />
                                </button>
                            </div>

                            <Grid container spacing={6} sx={{ pb: 38, px: 4 }} >
                                <Grid item xs={12}>
                                    <Card sx={{ borderRadius: 2 }}>
                                        <DataGrid
                                            rows={polls || []}
                                            columns={all_customer_columns}
                                            getRowId={(row) => row.poll_id}
                                            autoHeight
                                            components={{
                                                LoadingOverlay: LinearProgress,
                                            }}
                                            loading={loading}
                                            getRowHeight={() => "auto"}

                                            pagination
                                            paginationModel={paginationModel}
                                            pageSizeOptions={[25, 50, 75, 100]}
                                            rowCount={pagination?.totalUsers}
                                            paginationMode="server"
                                            onPaginationModelChange={setPaginationModel}


                                            // pagination
                                            // rowsPerPageOptions={[5, 10, 25]}
                                            // rowCount={pagination?.totalUsers || 0}
                                            // page={pageState.page - 1}
                                            // pageSize={pageState.pageSize}
                                            // paginationMode="server"
                                            // onPageChange={(newPage: number) => {
                                            //   setPageState((old) => ({ ...old, page: newPage + 1 }));
                                            // }}
                                            // onPageSizeChange={(newPageSize: number) =>
                                            //   setPageState((old) => ({ ...old, pageSize: newPageSize }))
                                            // }
                                            sx={tableStyles}
                                        />
                                    </Card>
                                </Grid>
                            </Grid>



                            <ConfirmBox
                                title="Poll"
                                name="poll"
                                open={deleteOpen}
                                closeDialog={() => setDeleteOpen(false)}
                                toDoFunction={deletePoll}
                                loading={deleteLoading}
                                sx={{ pb: 4, border: "2px solid red" }}
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}
export default Polls
