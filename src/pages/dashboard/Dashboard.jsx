import React, { useEffect, useState } from "react";
// import AdminNavbar from '../../../components/navbar/AdminNavbar';

import { useFirebase } from "../../context/firebase";
// material-ui
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Grid,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

// project import
import AnalyticEcommerce from "../../components/admin/AnalyticEcommerce";
import MainCard from "../../components/admin/MainCard";
import IncomeAreaChart from "./IncomeAreaChart";
import MonthlyBarChart from "./MonthlyBarChart";
import OrdersTable from "./OrdersTable";
import ReportAreaChart from "./ReportAreaChart";
import SalesColumnChart from "./SalesColumnChart";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
// assets
import {
  GiftOutlined,
  MessageOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import avatar1 from "../../assets/images/images/users/avatar-1.png";
import avatar2 from "../../assets/images/images/users/avatar-2.png";
import avatar3 from "../../assets/images/images/users/avatar-3.png";
import avatar4 from "../../assets/images/images/users/avatar-4.png";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: "1rem",
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: "auto",
  right: "auto",
  alignSelf: "flex-start",
  transform: "none",
};

// sales report status
const status = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "year",
    label: "This Year",
  },
];

const Dashboard = () => {
  const { getDocuments, firestore } = useFirebase();
  const navigate = useNavigate();
  const [cookies, setCookies] = useCookies(["adminId"]);
  const [value, setValue] = useState("today");
  const [slot, setSlot] = useState("week");
  const [reportsData, setReportsData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(null);
  const [adsCount, setAdsCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalViewsGenerated, setTotalViewsGenerated] = useState(0);
  const [completedAdsCount, setCompletedAdsCount] = useState(0);
  const [activeAdsCount, setActiveAdsCount] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [totalPostsCreated, setTotalPostsCreated] = useState(0);

  // useEffect(() => {
  //     const fetchData = async () => {
  //         try {
  //             const data = await getDocuments();
  //             setReportsData(data);
  //         } catch (error) {
  //             console.error('Error fetching data: ', error);
  //         }
  //     };

  //     fetchData();
  // }, [getDocuments]);

  // useEffect(() => {
  //     console.log(reportsData, "dsjfhdasfk");
  // }, [reportsData]);

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

  useEffect(() => {
    const fetchAdsCount = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        setAdsCount(adsSnapshot.size);
      } catch (error) {
        console.error("Error fetching ads count:", error);
      }
    };
    const fetchPostsCount = async () => {
      const firestore = getFirestore();
      const postsCollection = collection(firestore, "posts");

      try {
        const postsSnapshot = await getDocs(postsCollection);
        setTotalPostsCreated(postsSnapshot.size);
      } catch (error) {
        console.error("Error fetching ads count:", error);
      }
    };

    const fetchTotalProposedAmount = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        let totalProposedAmount = 0;

        adsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalProposedAmount += data.proposed_amount || 0; // Sum up proposed_amount
        });

        setTotalAmount(totalProposedAmount); // Update state with the total amount
      } catch (error) {
        console.error("Error fetching proposed amount:", error);
      }
    };

    const fetchTotalViewsGenerated = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        let totalViewsGenerated = 0;

        adsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalViewsGenerated += data.generated_views || 0; // Sum up proposed_amount
        });

        setTotalViewsGenerated(totalViewsGenerated); // Update state with the total amount
      } catch (error) {
        console.error("Error fetching views genrated:", error);
      }
    };

    // Function to fetch and count completed ads
    const fetchCompletedAdsCount = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        let completedCount = 0;

        adsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if the ad is completed (generated_views === target_views)
          if (data.generated_views === data.target_views) {
            completedCount++;
          }
        });

        setCompletedAdsCount(completedCount);
      } catch (error) {
        console.error("Error fetching completed ads:", error);
      }
    };

    // Function to fetch and count active ads
    const fetchActiveAdsCount = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        let activeCount = 0;

        adsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if the ad is active (generated_views < target_views)
          if (data.generated_views < data.target_views) {
            activeCount++;
          }
        });

        setActiveAdsCount(activeCount);
      } catch (error) {
        console.error("Error fetching active ads:", error);
      }
    };

    const fetchTotalAmountPaid = async () => {
      const firestore = getFirestore();
      const adsCollection = collection(firestore, "ads");

      try {
        const adsSnapshot = await getDocs(adsCollection);
        let totalPaid = 0;

        adsSnapshot.forEach((doc) => {
          const data = doc.data();
          // Calculate amountPerView (proposed_amount / target_views)
          const amountPerView = data.proposed_amount / data.target_views;
          // Calculate the total paid for the current ad (amountPerView * generated_views)
          const totalPaidForAd = amountPerView * data.generated_views;
          // Add to the total amount paid
          totalPaid += totalPaidForAd;
        });

        setTotalAmountPaid(totalPaid);
      } catch (error) {
        console.error("Error calculating total amount paid:", error);
      }
    };

    fetchTotalProposedAmount();
    fetchAdsCount();
    fetchPostsCount();
    fetchTotalViewsGenerated();
    fetchCompletedAdsCount();
    fetchActiveAdsCount();
    fetchTotalAmountPaid();
  }, []);

  return (
    <>
      <div>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <main>
              <div className="bg-gray-100">
                <Navbar />
                <Grid
                  sx={{ padding: "10px 20px" }}
                  container
                  rowSpacing={4.5}
                  columnSpacing={2.75}
                >
                  {/* row 1 */}
                  <Grid
                    item
                    xs={12}
                    sx={{ textAlign: "center", marginTop: "10px" }}
                  >
                    <Typography variant="h4">Dashboard</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Page Views"
                      count="4,42,236"
                      percentage={59.3}
                      extra="35,000"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Users"
                      count="78,250"
                      percentage={70.5}
                      extra="8,900"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Order"
                      count="18,800"
                      percentage={27.4}
                      isLoss
                      color="warning"
                      extra="1,943"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Sales"
                      count="$35,078"
                      percentage={27.4}
                      isLoss
                      color="warning"
                      extra="$20,395"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce title="Total Ads" count={adsCount} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Revenue Generated"
                      count={
                        <span>
                          {totalAmount}
                          <CurrencyRupeeIcon />
                        </span>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Views Generated"
                      count={totalViewsGenerated}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Active ads"
                      count={activeAdsCount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Completed ads"
                      count={completedAdsCount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <AnalyticEcommerce
                      title="Total Amount Paid to Pradhaans"
                      count={
                        <span>
                          {totalAmountPaid.toFixed(2)}
                          <CurrencyRupeeIcon />
                        </span>
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <Link to={"/posts"}>
                      <AnalyticEcommerce
                        title="Total Posts Created"
                        count={totalPostsCreated}
                      />
                    </Link>
                  </Grid>

                  <Grid
                    item
                    md={8}
                    sx={{ display: { sm: "none", md: "block", lg: "none" } }}
                  />

                  {/* row 2 */}
                  <Grid item xs={12} md={7} lg={8}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">Unique Visitor</Typography>
                      </Grid>
                      <Grid item>
                        <Stack direction="row" alignItems="center" spacing={0}>
                          <Button
                            size="small"
                            onClick={() => setSlot("month")}
                            color={slot === "month" ? "primary" : "secondary"}
                            variant={slot === "month" ? "outlined" : "text"}
                          >
                            Month
                          </Button>
                          <Button
                            size="small"
                            onClick={() => setSlot("week")}
                            color={slot === "week" ? "primary" : "secondary"}
                            variant={slot === "week" ? "outlined" : "text"}
                          >
                            Week
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                    <MainCard content={false} sx={{ mt: 1.5 }}>
                      <Box sx={{ pt: 1, pr: 2 }}>
                        <IncomeAreaChart slot={slot} />
                      </Box>
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} md={5} lg={4}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">Income Overview</Typography>
                      </Grid>
                      <Grid item />
                    </Grid>
                    <MainCard sx={{ mt: 2 }} content={false}>
                      <Box sx={{ p: 3, pb: 0 }}>
                        <Stack spacing={2}>
                          <Typography variant="h6" color="textSecondary">
                            This Week Statistics
                          </Typography>
                          <Typography variant="h3">$7,650</Typography>
                        </Stack>
                      </Box>
                      <MonthlyBarChart />
                    </MainCard>
                  </Grid>

                  {/* row 3 */}
                  <Grid item xs={12} md={7} lg={8}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">Recent Orders</Typography>
                      </Grid>
                      <Grid item />
                    </Grid>
                    <MainCard sx={{ mt: 2 }} content={false}>
                      <OrdersTable />
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} md={5} lg={4}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">Analytics Report</Typography>
                      </Grid>
                      <Grid item />
                    </Grid>
                    <MainCard sx={{ mt: 2 }} content={false}>
                      <List
                        sx={{ p: 0, "& .MuiListItemButton-root": { py: 2 } }}
                      >
                        <ListItemButton divider>
                          <ListItemText primary="Company Finance Growth" />
                          <Typography variant="h5">+45.14%</Typography>
                        </ListItemButton>
                        <ListItemButton divider>
                          <ListItemText primary="Company Expenses Ratio" />
                          <Typography variant="h5">0.58%</Typography>
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemText primary="Business Risk Cases" />
                          <Typography variant="h5">Low</Typography>
                        </ListItemButton>
                      </List>
                      <ReportAreaChart />
                    </MainCard>
                  </Grid>

                  {/* row 4 */}
                  <Grid item xs={12} md={7} lg={8}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">Sales Report</Typography>
                      </Grid>
                      <Grid item>
                        <TextField
                          id="standard-select-currency"
                          size="small"
                          select
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          sx={{
                            "& .MuiInputBase-input": {
                              py: 0.5,
                              fontSize: "0.875rem",
                            },
                          }}
                        >
                          {status.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <MainCard sx={{ mt: 1.75 }}>
                      <Stack spacing={1.5} sx={{ mb: -12 }}>
                        <Typography variant="h6" color="secondary">
                          Net Profit
                        </Typography>
                        <Typography variant="h4">$1560</Typography>
                      </Stack>
                      <SalesColumnChart />
                    </MainCard>
                  </Grid>
                  <Grid item xs={12} md={5} lg={4}>
                    <Grid
                      container
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Grid item>
                        <Typography variant="h5">
                          Transaction History
                        </Typography>
                      </Grid>
                      <Grid item />
                    </Grid>
                    <MainCard sx={{ mt: 2 }} content={false}>
                      <List
                        component="nav"
                        sx={{
                          px: 0,
                          py: 0,
                          "& .MuiListItemButton-root": {
                            py: 1.5,
                            "& .MuiAvatar-root": avatarSX,
                            "& .MuiListItemSecondaryAction-root": {
                              ...actionSX,
                              position: "relative",
                            },
                          },
                        }}
                      >
                        <ListItemButton divider>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                color: "success.main",
                                bgcolor: "success.lighter",
                              }}
                            >
                              <GiftOutlined />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                Order #002434
                              </Typography>
                            }
                            secondary="Today, 2:00 AM"
                          />
                          <ListItemSecondaryAction>
                            <Stack alignItems="flex-end">
                              <Typography variant="subtitle1" noWrap>
                                + $1,430
                              </Typography>
                              <Typography variant="h6" color="secondary" noWrap>
                                78%
                              </Typography>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                        <ListItemButton divider>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                color: "primary.main",
                                bgcolor: "primary.lighter",
                              }}
                            >
                              <MessageOutlined />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                Order #984947
                              </Typography>
                            }
                            secondary="5 August, 1:45 PM"
                          />
                          <ListItemSecondaryAction>
                            <Stack alignItems="flex-end">
                              <Typography variant="subtitle1" noWrap>
                                + $302
                              </Typography>
                              <Typography variant="h6" color="secondary" noWrap>
                                8%
                              </Typography>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                        <ListItemButton>
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                color: "error.main",
                                bgcolor: "error.lighter",
                              }}
                            >
                              <SettingOutlined />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1">
                                Order #988784
                              </Typography>
                            }
                            secondary="7 hours ago"
                          />
                          <ListItemSecondaryAction>
                            <Stack alignItems="flex-end">
                              <Typography variant="subtitle1" noWrap>
                                + $682
                              </Typography>
                              <Typography variant="h6" color="secondary" noWrap>
                                16%
                              </Typography>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItemButton>
                      </List>
                    </MainCard>
                    <MainCard sx={{ mt: 2 }}>
                      <Stack spacing={3}>
                        <Grid
                          container
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Grid item>
                            <Stack>
                              <Typography variant="h5" noWrap>
                                Help & Support Chat
                              </Typography>
                              <Typography
                                variant="caption"
                                color="secondary"
                                noWrap
                              >
                                Typical replay within 5 min
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid item>
                            <AvatarGroup
                              sx={{
                                "& .MuiAvatar-root": { width: 32, height: 32 },
                              }}
                            >
                              <Avatar alt="Remy Sharp" src={avatar1} />
                              <Avatar alt="Travis Howard" src={avatar2} />
                              <Avatar alt="Cindy Baker" src={avatar3} />
                              <Avatar alt="Agnes Walker" src={avatar4} />
                            </AvatarGroup>
                          </Grid>
                        </Grid>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ textTransform: "capitalize" }}
                        >
                          Need Help?
                        </Button>
                      </Stack>
                    </MainCard>
                  </Grid>
                </Grid>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
