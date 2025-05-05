import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Reports from "./pages/Reports";
import Sponsor from "./pages/Sponsor";
import Login from "./pages/Login";
import Polls from "./pages/Polls";
import News from "./pages/News";
import Payment from "./pages/Payment";
import Pradhaan from "./pages/Pradhaan";
import PhoneVerification from "./pages/PhoneVerification";
import AddRide from "./pages/AddRide";
import DailyRides from "./pages/DailyRides";
import Totalpost from "./pages/TotalPost";
import TotalAds from "./pages/TotalAds";
import AddAuto from "./pages/AddAuto";
import ListAuto from "./pages/ListAuto";
import Donations from "./pages/Donations";
import AddProoters from "./pages/AddProoters";
import ListPromoters from "./pages/ListPromoters";
import Payout from "./pages/Payout";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Dashboard></Dashboard>,
    },
    {
      path: "/pradhaan",
      element: <Pradhaan />,
    },
    {
      path: "/reports",
      element: <Reports />,
    },
    {
      path: "/sponsor",
      element: <Sponsor />,
    },
    {
      path: "/donations",
      element: <Donations />,
    },
    {
      path: "/posts",
      element: <Totalpost />,
    },
    {
      path: "/ads",
      element: <TotalAds />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/polls",
      element: <Polls />,
    },
    {
      path: "/news",
      element: <News />,
    },
    {
      path: "/phone-verification",
      element: <PhoneVerification />,
    },
    {
      path: "/payment",
      element: <Payment />,
    },
    {
      path: "/payout",
      element: <Payout />,
    },
    {
      path: "/add-ride/:autoId",
      element: <AddRide />,
    },
    {
      path: "/add-auto",
      element: <AddAuto />,
    },
    {
      path: "/add-promoters",
      element: <AddProoters />,
    },
    {
      path: "/daily-rides",
      element: <DailyRides />,
    },
    {
      path: "/auto",
      element: <ListAuto />,
    },
    {
      path: "/promoters",
      element: <ListPromoters />,
    },
  ]);

  return (
    <>
      <div className="App">
        <RouterProvider router={router} />
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
