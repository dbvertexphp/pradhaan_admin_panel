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

      const [loading, setLoading] = useState(false);
      const [updatePollState, setUpdatePollState] = useState(false);

      const [isAdmin, setIsAdmin] = useState(null);
      const { sponsors, getSponsors, firestore, query, orderBy} = useFirebase()
      console.log(sponsors);

      useEffect(() => {
            const fetchPolls = async () => {
                  try {
                        await getSponsors();
                  } catch (error) {
                        console.error('Error fetching sponsors:', error);
                  }
            };

      }, [getSponsors]);

      // useEffect(() => {
      //       const fetchAdminData = async () => {
      //             try {
      //                   const adminId = cookies.adminId;
      //                   if (adminId) {
      //                         const userDoc = await getDoc(doc(firestore, 'users', adminId));
      //                         const userData = userDoc.data();
      //                         const isAdmin = userData?.is_admin || false;
      //                         setIsAdmin(isAdmin);
      //                   } else {
      //                         toast.error("Please Login")
      //                         navigate('/login');
      //                   }
      //             } catch (error) {
      //                   console.error('Error fetching admin data:', error.message);
      //             }
      //       };

      //       fetchAdminData();
      // }, [cookies.adminId, firestore]);

      // useEffect(() => {
      //       if (isAdmin === false) {
      //             toast.error("Please Login");
      //             navigate('/login');
      //       }
      // }, [isAdmin]);

      const all_customer_columns = [
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "org_name",
                  headerName: "Organization Name",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },

            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "name",
                  headerName: "Name",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "email",
                  headerName: "Email",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "contact",
                  headerName: "Contact",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "amount",
                  headerName: "Amount",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "transactionId",
                  headerName: "Transaction Id",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },
            {
                  minWidth: 150,
                  flex: 0.25,
                  field: "createdAt",
                  headerName: "Created At",
                  align: "left",
                  headerAlign: "left",
                  disableColumnMenu: true,
            },


      ];
      const functions = getFunctions();
      const deleteDocumentRecursively = httpsCallable(functions, 'deleteDocumentRecursively');

      return (
            <div>
                  <div className='flex h-screen overflow-hidden'>
                        <Sidebar />
                        <div className='relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden'>
                              <main>
                                    <div className='bg-gray-100'>
                                          <Navbar />

                                          <Grid container spacing={6} sx={{ pb: 38, px: 4 }} >
                                                <Grid item xs={12}>
                                                      <Card sx={{ borderRadius: 2 }}>
                                                            <DataGrid
                                                                  rows={sponsors || []}
                                                                  columns={all_customer_columns}
                                                                  getRowId={(row) => row.id}
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




                                    </div>
                              </main>
                        </div>
                  </div>
            </div>
      )
}
export default Polls
