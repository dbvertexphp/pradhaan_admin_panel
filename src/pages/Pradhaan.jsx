import { Card, Grid, LinearProgress, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";

const Payment = () => {
      const { getPradhanData } = useFirebase(); // Fetch the Pradhaan data from Firebase context
      const [loading, setLoading] = useState(false);
      const [paginationModel, setPaginationModel] = useState({
            page: 0,
            pageSize: 25,
      });
      const [pradhaan, setPradhaan] = useState([]);

      useEffect(() => {
            const fetchPradhaanData = async () => {
                  setLoading(true);
                  try {
                        const data = await getPradhanData(
                              paginationModel.page,
                              paginationModel.pageSize
                        );
                        console.log(data);

                        setPradhaan(data); // Set the fetched Pradhaan data
                  } catch (error) {
                        console.error("Error fetching pradhaan data:", error);
                  } finally {
                        setLoading(false);
                  }
            };

            fetchPradhaanData();
      }, []);

      // Define columns based on the fields you want to show
      const pradhan_columns = [
            {
                  field: "pradhan_model",
                  headerName: "Name",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
                  valueGetter: (params) =>
                        params.row.pradhan_model?.name || "N/A", // Access 'name' inside 'pradhan_model' object
            },
            {
                  field: "image",
                  headerName: "Image",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
                  renderCell: (params) => (
                        <img
                              src={params.row.image}
                              alt={params.row.name}
                              style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    borderRadius: "50%",
                              }}
                        />
                  ), // Display image as an avatar
            },
            {
                  field: "id",
                  headerName: "Location",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
            },

            {
                  field: "voting",
                  headerName: "Voting",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
            },
            {
                  field: "level",
                  headerName: "Level",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
            },
            {
                  field: "totalEarnings",
                  headerName: "Total Earning",
                  minWidth: 150,
                  flex: 0.25,
                  align: "left",
                  headerAlign: "left",
                  renderCell: (params) => {
                      const earnings = params.row.totalEarnings || 0; // Default to 0 if totalEarnings is undefined
                      return `₹${earnings.toFixed(2)}`; // Display with a rupee symbol and two decimal places
                  },
              },

      ];

      return (
            <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                        <main>
                              <div className="bg-gray-100">
                                    <Navbar />
                                    <Grid
                                          container
                                          spacing={6}
                                          sx={{ pb: 38, px: 4 }}
                                    >
                                          <Grid item xs={12}>
                                                <Card sx={{ borderRadius: 2 }}>
                                                      <DataGrid
                                                            rows={
                                                                  pradhaan || []
                                                            }
                                                            columns={
                                                                  pradhan_columns
                                                            } // Set the updated columns here
                                                            getRowId={(row) =>
                                                                  row.id
                                                            } // Use 'id' as the row identifier
                                                            autoHeight
                                                            components={{
                                                                  LoadingOverlay:
                                                                        LinearProgress, // Show loading overlay
                                                            }}
                                                            loading={loading}
                                                            getRowHeight={() =>
                                                                  "auto"
                                                            }
                                                            pagination
                                                            paginationModel={
                                                                  paginationModel
                                                            }
                                                            pageSizeOptions={[
                                                                  25, 50, 75,
                                                                  100,
                                                            ]}
                                                            paginationMode="server"
                                                            onPaginationModelChange={
                                                                  setPaginationModel
                                                            } // Handle pagination changes
                                                            sx={{
                                                                  "& .MuiDataGrid-root":
                                                                        {
                                                                              border: "none",
                                                                        },
                                                                  "& .MuiDataGrid-cell":
                                                                        {
                                                                              py: 2,
                                                                        },
                                                            }}
                                                      />
                                                </Card>
                                          </Grid>
                                    </Grid>
                              </div>
                        </main>
                  </div>
            </div>
      );
};

export default Payment;
