import React from "react";
import { Link, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <>
      <div className="navbar bg-base-200 sticky top-0 z-40 py-4 md:px-[80px] px-[32px] w-full justify-between items-center">
        <div className="w-full lg:w-[50%] flex flex-row justify-between lg:block">
          <Link to="/" className="btn btn-ghost normal-case text-lg">
            GIS 2005551020
          </Link>
        </div>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-primary drawer-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-max flex flex-col items-end gap-1"
          >
            <li>
              <Link to="/">Cluster Marker</Link>
            </li>
            <li>
              <Link to="/polyline">Polyline</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="md:px-[80px] px-[32px] text-xs flex justify-center flex-col items-center gap-[100px] py-[40px] relative z-0">
        <Outlet />
      </div>
      <footer className="footer footer-center p-4 bg-primary text-base-content text-xs lg:text-sm md:px-[80px] px-[32px]">
        <aside>
          <p>
            Copyright © 2023 - Fran's Wahyu Virgawan as the owner and creator.
          </p>
        </aside>
      </footer>
    </>
  );
};

export default Layout;
