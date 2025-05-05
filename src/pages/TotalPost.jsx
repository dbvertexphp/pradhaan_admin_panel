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
  Modal,
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

const TotalPost = () => {
  const { getAllPosts } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [totalPosts, setTotalPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedPostDesc, setSelectedPostDesc] = useState("");
  const postsPerPage = 5;
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAllPosts();
        console.log("Fetched posts:", data);
        setTotalPosts(data.slice().reverse()); // Reverse the data order
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

  const handleReadMore = (postDesc) => {
    setSelectedPostDesc(postDesc);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPostDesc("");
  };

  const handleResetDateFilter = () => {
    setSelectedDate(null); // Reset the selected date
    setSearchKeyword("");
    setCurrentPage(1); // Optionally reset to the first page when resetting the filter
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenImageModal(true);
  };

  const filteredPosts = totalPosts.filter((post) => {
    const address = post.full_add.join(", "); // Join address array into a single string
    const postDate = new Date(post.createdAt.seconds * 1000); // Convert timestamp to Date object

    // Check if searchKeyword matches location or address
    const matchesSearch =
      post.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      address.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (post.userInfo &&
        post.userInfo.name &&
        post.userInfo.name.toLowerCase().includes(searchKeyword.toLowerCase()));

    // If selectedDate is not null, filter posts based on the selected date
    const matchesDate =
      !selectedDate ||
      (postDate.getFullYear() === selectedDate.year() &&
        postDate.getMonth() === selectedDate.month() &&
        postDate.getDate() === selectedDate.date());

    return matchesSearch && matchesDate;
  });

  // Paginate the filtered posts
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
              <h2 className="text-2xl font-bold mb-4 text-center">Posts</h2>

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
                  label="Search by Location , Address Or Username"
                  variant="standard"
                  sx={{ width: "15%", height: "56px" }} // Adjust width of the text field
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1); // Reset to first page on new search
                  }}
                />

                {/* Date Picker */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Select Date"
                    value={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    renderInput={(params) => <TextField {...params} />}
                    sx={{ width: "10%", height: "56px" }} // Adjust width of the date picker
                  />
                </LocalizationProvider>

                {/* Reset Date Filter Button */}
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
                          <TableCell align="left">Likes</TableCell>
                          <TableCell align="left">Comments</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell align="left">Description</TableCell>
                          <TableCell align="left">Post Image</TableCell>
                          <TableCell align="left">Full Address</TableCell>
                          <TableCell align="left">Date & Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPosts.map((post) => (
                          <TableRow key={post.post_id}>
                            <TableCell>
                              <img
                                src={
                                  post.userInfo.image ||
                                  "https://via.placeholder.com/60"
                                }
                                alt="Post"
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "8px",
                                  cursor: "pointer"
                                }}
                                onClick={() =>
                                  handleImageClick(post.userInfo.image)
                                }
                              />
                              <Typography
                                sx={{
                                  textAlign: "center",
                                  width: "80px",
                                  fontWeight: "500",
                                }}
                              >
                                {post.userInfo.name}
                              </Typography>
                            </TableCell>

                            <TableCell align="left">
                              {post.like_count}
                            </TableCell>
                            <TableCell align="left">
                              {post.comments_count}
                            </TableCell>
                            <TableCell>{post.location}</TableCell>
                            <TableCell align="left">
                              {post.post_desc.length > 50 ? (
                                <>
                                  {post.post_desc.slice(0, 50)}...
                                  <Button
                                    variant="text"
                                    onClick={() =>
                                      handleReadMore(post.post_desc)
                                    }
                                  >
                                    Read More
                                  </Button>
                                </>
                              ) : (
                                post.post_desc
                              )}
                            </TableCell>
                            <TableCell>
                              <img
                                src={
                                  post.post_image ||
                                  "https://via.placeholder.com/60"
                                }
                                alt="Post"
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "8px",
                                  cursor: "pointer"
                                }}
                                onClick={() => handleImageClick(post.post_image)}
                              />
                            </TableCell>
                            <TableCell>{post.full_add.join(", ")}</TableCell>
                            <TableCell align="left">
                              {new Date(
                                post.createdAt.seconds * 1000
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

                  {/* Modal for displaying full post description */}
                  <Modal open={openModal} onClose={handleCloseModal}>
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                      }}
                    >
                      <Typography variant="h6" component="h2" mb={2}>
                        Full Post Description
                      </Typography>
                      <Typography variant="body1">
                        {selectedPostDesc}
                      </Typography>
                      <Box mt={2} display="flex" justifyContent="flex-end">
                        <Button variant="contained" onClick={handleCloseModal}>
                          Close
                        </Button>
                      </Box>
                    </Box>
                  </Modal>

                  {/* Image Modal */}
                  <Dialog open={openImageModal} onClose={() => setOpenImageModal(false)}>
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

export default TotalPost;
