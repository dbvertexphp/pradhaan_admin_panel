import { Card, Grid, LinearProgress, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import { useFirebase } from "../context/firebase";
import axios from "axios";
// const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
// const razorpaySecret = import.meta.env.VITE_RAZORPAY_SECRET;
// import { getFunctions, httpsCallable } from "firebase/functions";
// import { initializeApp } from "firebase/app";
// import axios from "axios";

// const firebaseConfig = {
//   apiKey: "AIzaSyCN2Q-jQqFJUzpHohPD16CJV4LwKg6nvf8",
//   authDomain: "chunaw-a66df.firebaseapp.com",
//   projectId: "chunaw-a66df",
//   storageBucket: "chunaw-a66df.appspot.com",
//   messagingSenderId: "379389559599",
//   appId: "1:379389559599:web:e3788d2d8872cf629d17da",
// };
// const app = initializeApp(firebaseConfig);

const Payment = () => {
  const { getTransactionHistory } = useFirebase();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setLoading(true);
      try {
        const data = await getTransactionHistory(
          paginationModel.page,
          paginationModel.pageSize
        );
        console.log(data);
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transaction history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionHistory();
  }, [getTransactionHistory, paginationModel]);

  const data = {
      data: {
        name: "Gaurav Kumar",
        email: "gaurav.kumar@example.com",
        contact: 9000090000,
        accountNumber: "123456789012",
        ifsc: "HDFC0001234",
        reference_id: "Acme Contact ID 12345",
        notes: {
          random_key_1: "Make it so.",
          random_key_2: "Tea. Earl Grey. Hot.",
        },
      },
    };

  const handleAddAccount = async () => {
    try {
      const res = await axios.post(
        "https://us-central1-chunaw-a66df.cloudfunctions.net/addCustomer",
        data
      );
      console.log(res.data);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  const all_customer_columns = [
    {
      minWidth: 150,
      flex: 0.25,
      field: "uid",
      headerName: "Name",
      align: "left",
      headerAlign: "left",
      disableColumnMenu: true,
      valueGetter: (params) => params.row.bankDetails?.yourName || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.25,
      field: "amount",
      headerName: "Amount",
      align: "left",
      headerAlign: "left",
      disableColumnMenu: true,
      valueGetter: (params) => params.row.amount || 0, // Safeguard in case it's missing
    },
    {
      minWidth: 150,
      flex: 0.25,
      field: "note",
      headerName: "Note",
      align: "left",
      headerAlign: "left",
      disableColumnMenu: true,
    },
    {
      minWidth: 150,
      flex: 0.25,
      field: "failed",
      headerName: "Failed",
      align: "left",
      headerAlign: "left",
      disableColumnMenu: true,
      valueGetter: (params) => (params.row.failed ? "Yes" : "No"), // Converting boolean to Yes/No
    },
    {
      minWidth: 150,
      flex: 0.25,
      field: "status",
      headerName: "Status",
      align: "left",
      headerAlign: "left",
      disableColumnMenu: true,
      valueGetter: (params) => (params.row.status ? "Completed" : "Pending"), // Converting boolean to a more readable format
    },
    {
      minWidth: 150,
      flex: 0.25,
      field: "pay",
      headerName: "Add Account",
      align: "center",
      headerAlign: "center",
      disableColumnMenu: true,
      renderCell: () => (
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={() => handleAddAccount()}
        >
          Add
        </Button>
      ),
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <main>
          <div className="bg-gray-100">
            <Navbar />
            <Grid container spacing={6} sx={{ pb: 38, px: 4 }}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <DataGrid
                    rows={transactions || []}
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
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    sx={{
                      "& .MuiDataGrid-root": {
                        border: "none",
                      },
                      "& .MuiDataGrid-cell": {
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
