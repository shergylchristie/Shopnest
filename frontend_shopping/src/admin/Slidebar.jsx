import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";

const Slidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* TOP HEADER on mobile */}
      <div className="lg:hidden fixed top-0 left-0 w-full bg-gray-800 text-white flex items-center justify-between mt-16 px-5 py-4 shadow-md z-40">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
        <button onClick={() => setOpen(true)}>
          <FiMenu size={24} />
        </button>
      </div>

      {/* SIDEBAR FOR LARGE SCREENS (no fixed here) */}
      <aside className="hidden lg:flex flex-col w-56 bg-gray-800 text-white h-full px-4 py-6">
        <h1 className="text-2xl mb-8 font-semibold">Admin Panel</h1>
        <SidebarLinks />
      </aside>

      {/* MOBILE SLIDE-IN SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-50 mt-16 flex">
          <div
            className="flex-1 bg-black/40"
            onClick={() => setOpen(false)}
          ></div>

          <aside className="w-64 bg-gray-800 text-white h-full px-6 py-3 shadow-lg">
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-xl">Admin Panel</h1>
              <button onClick={() => setOpen(false)}>
                <FiX size={24} />
              </button>
            </div>
            <SidebarLinks close={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

function SidebarLinks({ close }) {
  return (
    <nav className="flex flex-col space-y-6">
      <Link
        onClick={close}
        to="/admin/dashboard"
        className="hover:text-green-400"
      >
        Admin Dashboard
      </Link>
      <Link
        onClick={close}
        to="/admin/manageProducts"
        className="hover:text-green-400"
      >
        Manage Products
      </Link>
      <Link
        onClick={close}
        to="/admin/manageQuery"
        className="hover:text-green-400"
      >
        Manage Query
      </Link>
      <Link onClick={close} to="/" className="hover:text-red-400">
        Exit
      </Link>
    </nav>
  );
}

export default Slidebar;
