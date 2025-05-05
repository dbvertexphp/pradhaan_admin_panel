import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { AiOutlineOrderedList } from "react-icons/ai";
import { BiSolidCoupon, BiSolidUser } from "react-icons/bi";
import {
  FaArrowRight,
  FaArrowLeft,
  FaAddressBook,
  FaPoll,
} from "react-icons/fa"; // Import arrow icons from react-icons
import { MdAnalytics, MdInventory, MdOutlineSettings } from "react-icons/md";
import { MdOutlinePayments } from "react-icons/md";
import { MdPostAdd } from "react-icons/md";
import { TbBrandProducthunt } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { VscReport } from "react-icons/vsc";
import { FaNewspaper } from "react-icons/fa6";
import { MdPayment } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { IoMdAddCircle } from "react-icons/io";
import { FaTaxi } from "react-icons/fa";
import { FaListAlt } from "react-icons/fa";
import { CiBadgeDollar } from "react-icons/ci";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [cookies, setCookies, removeCookies] = useCookies(["adminId"]);
  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    console.log(location.pathname, "path");
  }, []);

  const handleLogout = () => {
    navigate("/login");
    toast("Logout Successfully");
    removeCookies("adminId");
    localStorage.removeItem("isAdmin");
  };

  return (
    <>
      <aside
        className={`flex bg-primary-blue transition-all duration-300 ${
          isExpanded ? "w-60" : "w-16"
        }`}
      >
        <div className=" bg-primary-blue flex relative flex-col items-center w-full h-screen p-2 space-y-3 dark:bg-gray-900 dark:border-gray-700 overflow-y-auto">
          <button
            style={{ border: "2px solid white" }}
            className={`z-50 mt-10 p-3 relative transition-all duration-300 ${
              isExpanded ? " top-0 left-[90px]" : "top-0 left-1"
            }   rounded-full text-gray-100 focus:outline-none transition-colors duration-200 bg-primary-blue dark:text-gray-400 dark:hover:bg-gray-800 hover:bg-gray-100 hover:text-primary-blue`}
            onClick={toggleSidebar}
          >
            {isExpanded ? <FaArrowLeft /> : <FaArrowRight />}
          </button>
          <div
            onClick={() => navigate("/")}
            className={`flex ${
              location?.pathname === "/"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } gap-1 items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            }`}
          >
            <div className="p-2">
              <FaAddressBook className="w-auto h-6" />
            </div>
            {isExpanded && <p>Dashboard</p>}
          </div>
          <div
            onClick={() => navigate("/pradhaan")}
            className={`flex gap-1 ${
              location?.pathname === "/pradhaan"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaUsers className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Pradhaan</p> : ""}
          </div>

          <div
            onClick={() => navigate("/reports")}
            className={`flex gap-1 ${
              location?.pathname === "/reports"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <VscReport className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Reports</p> : ""}
          </div>

          <div
            onClick={() => navigate("/polls")}
            className={`flex gap-1 ${
              location?.pathname === "/polls"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaPoll className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Polls</p> : ""}
          </div>

          <div
            onClick={() => navigate("/news")}
            className={`flex gap-1 ${
              location?.pathname === "/news"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaNewspaper className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">News</p> : ""}
          </div>

          <div
            onClick={() => navigate("/payment")}
            className={`flex gap-1 ${
              location?.pathname === "/payment"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <MdPayment className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Payment</p> : ""}
          </div>

          <div
            onClick={() => navigate("/payout")}
            className={`flex gap-1 ${
              location?.pathname === "/payout"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <MdPayment className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Weekly Payouts</p> : ""}
          </div>

          <div
            onClick={() => navigate("/sponsor")}
            className={`flex gap-1 ${
              location?.pathname === "/sponsor"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <MdOutlinePayments className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Sponsor</p> : ""}
          </div>

          <div
            onClick={() => navigate("/donations")}
            className={`flex gap-1 ${
              location?.pathname === "/donations"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <CiBadgeDollar className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Donations</p> : ""}
          </div>

          <div
            onClick={() => navigate("/posts")}
            className={`flex gap-1 ${
              location?.pathname === "/posts"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <MdPostAdd className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Posts</p> : ""}
          </div>

          <div
            onClick={() => navigate("/ads")}
            className={`flex gap-1 ${
              location?.pathname === "/ads"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaListAlt className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Ads List</p> : ""}
          </div>

          <div
            onClick={() => navigate("/add-auto")}
            className={`flex gap-1 ${
              location?.pathname === "/add-auto"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <IoMdAddCircle className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Add Auto</p> : ""}
          </div>

          <div
            onClick={() => navigate("/daily-rides")}
            className={`flex gap-1 ${
              location?.pathname === "/daily-rides"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaTaxi className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Daily Rides</p> : ""}
          </div>

          <div
            onClick={() => navigate("/auto")}
            className={`flex gap-1 ${
              location?.pathname === "/auto"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaTaxi className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">List Auto</p> : ""}
          </div>

          <div
            onClick={() => navigate("/promoters")}
            className={`flex gap-1 ${
              location?.pathname === "/promoters"
                ? "bg-gray-100 text-primary-blue"
                : "bg-primary-blue text-white"
            } items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-primary-blue" : "text-primary-blue"
            } `}
          >
            <div className="p-2">
              <FaTaxi className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">List Promoters</p> : ""}
          </div>

          <div
            onClick={handleLogout}
            className={`flex gap-1 items-center justify-start w-full hover:bg-white hover:text-primary-blue ${
              isExpanded ? "text-white" : "text-white"
            } `}
          >
            <div className="p-2">
              <BiSolidUser className="w-auto h-6 " />
            </div>
            {isExpanded ? <p className="">Logout</p> : ""}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
