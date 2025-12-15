import React from "react";
import Slidebar from "../admin/Slidebar";

const AdminDashboard = () => {
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-10 md:pt-6 p-6">
          <h1 className="text-xl md:text-4xl mb-4 md:mb-8 font-bold font-mono">
            Admin Dashboard
          </h1>

          <div className="grid grid-col-1">
            <div className=" bg-slate-100 rounded-lg shadow-lg p-6">
              <h1 className="text-2xl text-gray-600 font-semibold mb-3">
                Products
              </h1>
              <p className="text-4xl text-blue-600 font-semibold">20</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
