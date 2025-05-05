import React, { useEffect, useState } from "react";
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
  LinearProgress,
  Pagination,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const TotalAds = () => {
  const { getAllAds } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllAds();
        console.log("Fetched posts:", data);
        setTotalPosts(data); // Reverse the data order
      } catch (error) {
        console.error("Error fetching posts data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleResetDateFilter = () => {
    setSelectedDate(null); // Reset the selected date
    setSearchKeyword("");
    setCurrentPage(1); // Optionally reset to the first page when resetting the filter
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  const filteredPosts = totalPosts.filter((post) => {
    const postDate = new Date(post.created_at.seconds * 1000); // Convert timestamp to Date object

    // Check if searchKeyword matches location or address
    const matchesSearch =
      post.userInfo &&
      post.userInfo.name &&
      post.userInfo.name.toLowerCase().includes(searchKeyword.toLowerCase());

    // If selectedDate is not null, filter posts based on the selected date
    const matchesDate =
      !selectedDate ||
      (postDate.getFullYear() === selectedDate.year() &&
        postDate.getMonth() === selectedDate.month() &&
        postDate.getDate() === selectedDate.date());

    return matchesSearch && matchesDate;
  });

  // Pagination logic: Get the current page's posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <div className="p-4" style={{ width: "100%", margin: "auto" }}>
              <h2 className="text-2xl font-bold mb-4 text-center">Ads List</h2>

              {loading && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                </Box>
              )}

              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "start", // Distribute the items evenly across the row
                  width: "100%",
                  marginTop: "30px",
                  gap: "30px",
                  alignItems: "center",
                }}
              >
                {/* Search by Location or Address */}
                <TextField
                  id="standard-basic"
                  label="Search by Username"
                  variant="standard"
                  sx={{ width: "15%", height: "56px" }} // Adjust width of the text field
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                />

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    renderInput={(params) => <TextField {...params} />}
                    sx={{ width: "10%", height: "56px" }} // Adjust width of the date picker
                  />
                </LocalizationProvider>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleResetDateFilter}
                  sx={{ width: "10%", height: "56px" }} // Adjust width of the button
                >
                  Reset Filter
                </Button>
              </Box>

              {!loading && (
                <>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 1000 }} aria-label="posts table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">User Name</TableCell>
                          <TableCell align="left">Description</TableCell>
                          <TableCell align="left">Generated_Views</TableCell>
                          <TableCell align="left">Target_Views</TableCell>
                          <TableCell align="left">Image</TableCell>
                          <TableCell align="left">Title</TableCell>
                          <TableCell align="left">Payment_Id</TableCell>
                          <TableCell align="left">Proposed_Amount</TableCell>
                          <TableCell align="left">Pay_Amount</TableCell>
                          <TableCell align="left">Date & Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPosts.map((ads) => (
                          <TableRow key={ads.id}>
                            <TableCell>
                              <img
                                src={
                                  ads.userInfo.image ||
                                  "https://via.placeholder.com/60"
                                }
                                alt="Post"
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  handleImageClick(ads.userInfo.image)
                                }
                              />
                              <Typography
                                sx={{
                                  textAlign: "center",
                                  width: "80px",
                                  fontWeight: "500",
                                }}
                              >
                                {ads.userInfo.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="left">
                              {ads.description}
                            </TableCell>
                            <TableCell align="left">
                              {ads.generated_views}
                            </TableCell>
                            <TableCell align="left">
                              {ads.target_views}
                            </TableCell>

                            <TableCell>
                              <img
                                src={
                                  ads.images[0] ||
                                  "https://via.placeholder.com/60"
                                }
                                alt="Post"
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleImageClick(ads.images[0])}
                              />
                            </TableCell>
                            <TableCell>{ads.title}</TableCell>
                            <TableCell>{ads.payment_id}</TableCell>
                            <TableCell>{ads.proposed_amount}</TableCell>
                            <TableCell>
                              {Math.round(
                                (ads.proposed_amount / ads.target_views) *
                                  ads.generated_views *
                                  100
                              ) / 100}
                            </TableCell>

                            <TableCell align="left">
                              {new Date(
                                ads.created_at.seconds * 1000
                              ).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box mt={4} display="flex" justifyContent="center">
                    <Pagination
                      count={Math.ceil(filteredPosts.length / postsPerPage)}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>

                  {/* Image Modal */}
                  <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                    <DialogTitle>Image Preview</DialogTitle>
                    <DialogContent>
                      <img
                        src={selectedImage}
                        alt="Preview"
                        style={{ width: "100%", height: "auto" }}
                      />
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TotalAds;
