import {
  Card,
  Grid,
  LinearProgress,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Utility to get payout dates (last 10 Sundays)
const getPayoutDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - today.getDay() - i * 7);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    dates.push(`payout_${yyyy}-${mm}-${dd}`);
  }
  return dates.sort().reverse();
};

// Utility to convert level number to location type
const getLocationType = (level) => {
  switch (level) {
    case 1:
      return "Ward/Postal";
    case 2:
      return "City";
    case 3:
      return "State";
    case 4:
      return "Country";
    default:
      return "N/A";
  }
};

const Payout = () => {
  const db = getFirestore(initializeApp);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openBankDialog, setOpenBankDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [status, setStatus] = useState("");
  const [lastDocs, setLastDocs] = useState({});
  const [totalRows, setTotalRows] = useState(0);
  const cache = useRef({ counts: {}, lastFetched: null });

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      try {
        const payoutDates = getPayoutDates();
        let allPayouts = [];

        // Cache total count if not already cached or expired
        if (
          !cache.current.counts.total ||
          !cache.current.lastFetched ||
          Date.now() - cache.current.lastFetched > 3600000
        ) {
          const countPromises = payoutDates.map(async (payoutPath) => {
            const payoutsRef = collection(
              db,
              "payouts",
              payoutPath,
              "pradhaan_payouts"
            );
            const snapshot = await getDocs(payoutsRef);
            return { path: payoutPath, count: snapshot.size };
          });

          const counts = await Promise.all(countPromises);
          cache.current.counts = counts.reduce(
            (acc, { path, count }) => ({
              ...acc,
              [path]: count,
            }),
            {}
          );
          cache.current.lastFetched = Date.now();

          const totalCount = counts.reduce((sum, { count }) => sum + count, 0);
          setTotalRows(totalCount);
        } else {
          setTotalRows(
            Object.values(cache.current.counts).reduce(
              (sum, count) => sum + count,
              0
            )
          );
        }

        // Calculate which payout dates to fetch for current page
        const itemsPerPage = paginationModel.pageSize;
        const startIndex = paginationModel.page * itemsPerPage;
        let currentCount = 0;
        const targetPayouts = [];

        for (const payoutPath of payoutDates) {
          const docCount = cache.current.counts[payoutPath] || 0;
          if (currentCount + docCount > startIndex) {
            targetPayouts.push(payoutPath);
          }
          currentCount += docCount;
          if (currentCount >= startIndex + itemsPerPage) {
            break;
          }
        }

        // Fetch data in parallel for target payout dates
        const fetchPromises = targetPayouts.map(async (payoutPath) => {
          const payoutsRef = collection(
            db,
            "payouts",
            payoutPath,
            "pradhaan_payouts"
          );
          let q = query(
            payoutsRef,
            orderBy("created_at", "desc"),
            limit(
              Math.min(
                itemsPerPage - allPayouts.length,
                cache.current.counts[payoutPath] || itemsPerPage
              )
            )
          );

          if (lastDocs[payoutPath]) {
            q = query(
              payoutsRef,
              orderBy("created_at", "desc"),
              startAfter(lastDocs[payoutPath]),
              limit(
                Math.min(
                  itemsPerPage - allPayouts.length,
                  cache.current.counts[payoutPath] || itemsPerPage
                )
              )
            );
          }

          const snapshot = await getDocs(q);
          const payouts = snapshot.docs.map((doc) => ({
            id: doc.id,
            payoutDate: payoutPath,
            ...doc.data(),
          }));

          setLastDocs((prev) => ({
            ...prev,
            [payoutPath]: snapshot.docs[snapshot.docs.length - 1],
          }));

          return payouts;
        });

        const results = await Promise.all(fetchPromises);
        allPayouts = results.flat();

        // Add serial numbers using a loop
        const startSerial = paginationModel.page * paginationModel.pageSize + 1;
        allPayouts = allPayouts.map((payout, index) => ({
          ...payout,
          serial_number: startSerial + index,
        }));

        setTransactions(allPayouts);
      } catch (error) {
        console.error("Error fetching payouts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [paginationModel.page, paginationModel.pageSize]);

  const handleOpenUpdateDialog = (row) => {
    setSelectedRow(row);
    setTransactionId(row.transaction_id || "");
    setStatus(row.status || "");
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setSelectedRow(null);
  };

  const handleOpenBankDialog = (row) => {
    setSelectedRow(row);
    setOpenBankDialog(true);
  };

  const handleCloseBankDialog = () => {
    setOpenBankDialog(false);
    setSelectedRow(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRow) return;

    try {
      const docRef = doc(
        db,
        "payouts",
        selectedRow.payoutDate,
        "pradhaan_payouts",
        selectedRow.id
      );
      await updateDoc(docRef, {
        status: status,
        transaction_id: transactionId,
      });

      setTransactions((prev) =>
        prev.map((t) =>
          t.id === selectedRow.id && t.payoutDate === selectedRow.payoutDate
            ? { ...t, status, transaction_id: transactionId }
            : t
        )
      );
      handleCloseUpdateDialog();
      alert("Updated successfully!");
    } catch (error) {
      console.error("Failed to update document:", error);
      alert("Failed to update!");
    }
  };

  const columns = [
    {
      minWidth: 70,
      flex: 0.1,
      field: "serial_number",
      headerName: "S.No",
      valueGetter: (params) => params.row.serial_number || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "pradhan_name",
      headerName: "User Name",
      valueGetter: (params) => params.row.pradhan_name || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "level",
      headerName: "Pradhaan",
      valueGetter: (params) => getLocationType(params.row.level),
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "address",
      headerName: "Location",
      valueGetter: (params) =>
        Array.isArray(params.row.full_address)
          ? "N/A"
          : params.row.full_address?.address || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "bank_details",
      headerName: "Bank Details",
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => handleOpenBankDialog(params.row)}
        >
          View Details
        </Button>
      ),
    },
    {
      minWidth: 120,
      flex: 0.15,
      field: "amount",
      headerName: "Amount",
      valueGetter: (params) => params.row.amount_due || 0,
    },
    {
      minWidth: 120,
      flex: 0.15,
      field: "payout_date",
      headerName: "Payout Date",
      valueGetter: (params) =>
        params.row.payoutDate?.replace("payout_", "") || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "transaction_id",
      headerName: "Transaction ID",
      valueGetter: (params) => params.row.transaction_id || "N/A",
    },
    {
      minWidth: 120,
      flex: 0.15,
      field: "status",
      headerName: "Status",
      valueGetter: (params) => params.row.status || "N/A",
    },
    {
      minWidth: 150,
      flex: 0.2,
      field: "action",
      headerName: "Action",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenUpdateDialog(params.row)}
        >
          Update
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
                    rows={transactions}
                    columns={columns}
                    getRowId={(row) => `${row.id}_${row.payoutDate}`}
                    autoHeight
                    components={{
                      LoadingOverlay: LinearProgress,
                    }}
                    loading={loading}
                    rowCount={totalRows}
                    pagination
                    paginationModel={paginationModel}
                    pageSizeOptions={[25, 50, 75, 100]}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    getRowHeight={() => "auto"}
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

      {/* Update Transaction Dialog */}
      <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog}>
        <DialogTitle>Update Transaction</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Transaction ID"
            fullWidth
            variant="outlined"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Status"
            fullWidth
            variant="outlined"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateStatus}
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bank Details Dialog */}
      <Dialog open={openBankDialog} onClose={handleCloseBankDialog}>
        <DialogTitle>Bank Details</DialogTitle>
        <DialogContent>
          {selectedRow?.bank_details ? (
            <>
              <Typography variant="body1" gutterBottom>
                <strong>Account Number:</strong>{" "}
                {selectedRow.bank_details.account_number || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Bank Name:</strong>{" "}
                {selectedRow.bank_details.bank_name || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>IFSC Code:</strong>{" "}
                {selectedRow.bank_details.ifsc_number || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Bank Address:</strong>{" "}
                {selectedRow.bank_details.bank_address || "N/A"}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Account Holder:</strong>{" "}
                {selectedRow.bank_details.your_name || "N/A"}
              </Typography>
            </>
          ) : (
            <Typography variant="body1">No bank details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseBankDialog}
            variant="contained"
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Payout;
