import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";
import { useNavigate } from "react-router-dom"; // Import useNavigate

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
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const ListPromoters = () => {
  const { getAllPromoters } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [totalPromoters, setTotalPromoters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const [openModal, setOpenModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromoters = async () => {
      setLoading(true);
      try {
        const data = await getAllPromoters();
        console.log("Fetched promoters:", data);
        setTotalPromoters(data); // Ensure data is properly set here
      } catch (error) {
        console.error("Error fetching promoters data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoters();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setOpenModal(true);
  };

  // Pagination logic: Get the current page's posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPromoters = totalPromoters.slice(
    indexOfFirstPost,
    indexOfLastPost
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <div className="p-4" style={{ width: "100%", margin: "auto" }}>
              <h2 className="text-2xl font-bold mb-4 text-center">
                Promoters List
              </h2>

              {loading && (
                <Box sx={{ width: "100%" }}>
                  <LinearProgress />
                </Box>
              )}

              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "start",
                  width: "100%",
                  marginTop: "30px",
                  gap: "30px",
                  alignItems: "center",
                }}
              >
                {/* Search by Username (Removed) */}

                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/add-promoters")} // Navigate to the /add_promoters page
                >
                  Add Promoter
                </Button>
              </Box>

              {!loading && (
                <>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 1000 }} aria-label="promoters table">
                      <TableHead>
                        <TableRow>
                          <TableCell align="left">Name</TableCell>
                          <TableCell align="left">Total Contribution</TableCell>
                          <TableCell align="left">
                            Weekly Contribution
                          </TableCell>
                          <TableCell align="left">Username</TableCell>
                          <TableCell align="left">Location</TableCell>
                          <TableCell align="left">Date & Time</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPromoters.map((data) => (
                          <TableRow key={data.id}>
                            <TableCell>
                              <Typography
                                sx={{
                                  textAlign: "center",
                                  width: "80px",
                                  fontWeight: "500",
                                }}
                              >
                                {data.name}
                              </Typography>
                              <img
                                src={
                                  data.image || "https://via.placeholder.com/60"
                                }
                                alt="Post"
                                style={{
                                  width: 80,
                                  height: 80,
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleImageClick(data.image)}
                              />
                            </TableCell>
                            <TableCell align="left">
                              {data.total_contribution}
                            </TableCell>
                            <TableCell align="left">
                              {data.weekly_contribution}
                            </TableCell>
                            <TableCell align="left">{data.username}</TableCell>
                            <TableCell align="left">{data.scope}</TableCell>
                            <TableCell align="left">
                              {new Date(
                                data.datetime.seconds * 1000
                              ).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box mt={4} display="flex" justifyContent="center">
                    <Pagination
                      count={Math.ceil(totalPromoters.length / postsPerPage)}
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

export default ListPromoters;
