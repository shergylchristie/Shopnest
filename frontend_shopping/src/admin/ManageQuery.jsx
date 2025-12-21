import React, { useState, useEffect } from "react";
import Slidebar from "../admin/Slidebar";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";
import { Skeleton } from "@mui/material";

const ManageQuerySkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 md:pt-6 p-6">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-5 font-bold font-mono">
        <Skeleton variant="text" width={120} height={40} />
      </h1>

      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full border-collapse table-fixed text-sm lg:text-base">
          <thead>
            <tr className="bg-gray-100">
              {[
                { width: "100px", label: "Name" },
                { width: "200px", label: "Query" },
                { width: "140px", label: "Email" },
                { width: "80px", label: "Status" },
                { width: "160px", label: "Action" },
              ].map((col, i) => (
                <th key={i} className="px-4 lg:px-6 py-3 text-left w-[120px]">
                  <Skeleton variant="text" width={col.width} height={24} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-t border-gray-200 hover:bg-gray-50 transition"
              >
                {[
                  { width: "90%" },
                  { width: "100%", multiline: true },
                  { width: "95%" },
                  { width: "60px", height: 20 },
                  { action: true },
                ].map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 lg:px-6 py-3 lg:py-4 align-middle"
                  >
                    {cell.action ? (
                      <div className="flex flex-wrap gap-2">
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={32}
                          className="!rounded-md"
                        />
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={32}
                          className="!rounded-md"
                        />
                      </div>
                    ) : cell.multiline ? (
                      <div className="space-y-1">
                        <Skeleton
                          variant="text"
                          width={cell.width}
                          height={16}
                        />
                        <Skeleton variant="text" width="80%" height={16} />
                      </div>
                    ) : (
                      <Skeleton variant="text" width={cell.width} height={20} />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      
      <div className="grid gap-4 md:hidden mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex items-center justify-between mb-2">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton
                variant="rectangular"
                width={50}
                height={18}
                className="!rounded-full"
              />
            </div>
            <Skeleton variant="text" width={120} height={14} className="mb-1" />
            <Skeleton variant="text" width="100%" height={16} />
            <Skeleton variant="text" width="90%" height={16} />
            <div className="flex items-center gap-3 mt-4">
              <Skeleton
                variant="rectangular"
                width="45%"
                height={36}
                className="!rounded-md bg-gray-200 !border !border-gray-300"
              />
              <Skeleton
                variant="rectangular"
                width="45%"
                height={36}
                className="!rounded-md bg-gray-200 !border !border-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageQuery = () => {
  const [query, setQuery] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const token = localStorage.getItem("token");

  async function handleDelete(id) {
    try {
      const response = await apiFetch(`/api/deleteQuery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        handleQuery();
      } else toast.error(result.message);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  }

  async function handleQuery() {
    try {
      setLoadingQueries(true);
      const response = await apiFetch("/api/getQuery", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setQuery(result);
    } catch (error) {
      toast.error(error.message || "Failed to fetch queries");
    } finally {
      setLoadingQueries(false);
    }
  }

  useEffect(() => {
    handleQuery();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <Slidebar />
      {loadingQueries ? (
        <ManageQuerySkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 md:pt-6 p-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-5 font-bold font-mono">
            Queries
          </h1>

          {query.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6 sm:p-10 text-center text-gray-600">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                No queries here
              </h2>
              <img
                src="/empty.png"
                alt="No queries"
                className="w-40 sm:w-60 md:w-80 lg:w-96"
              />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full border-collapse table-fixed text-sm lg:text-base">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 lg:px-6 py-3 text-left w-[120px]">
                        Name
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left w-[200px]">
                        Query
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left w-[140px]">
                        Email
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left w-[80px]">
                        Status
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left w-[160px]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4 w-[120px]">
                          {item.name}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 w-[200px] break-words whitespace-normal">
                          {item.query}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 w-[140px]">
                          {item.email}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 w-[80px]">
                          {item.status}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 w-[160px]">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/admin/queryReply/${item._id}`}
                              className="text-xs sm:text-sm text-white bg-green-600 border-2 border-green-600 rounded-md hover:scale-105 px-2 py-1 transition"
                            >
                              Reply
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-xs sm:text-sm text-white bg-red-600 border-2 border-red-600 rounded-md hover:scale-105 px-2 py-1 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:hidden">
                {query.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 shadow-sm bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-1">{item.email}</p>

                    <p className="text-sm text-gray-700 mt-2 break-words whitespace-normal">
                      {item.query}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to={`/admin/queryReply/${item._id}`}
                        className="flex-1 text-center text-xs font-medium text-white bg-green-600 border-2 border-green-600 rounded-md px-3 py-2 hover:scale-105 transition"
                      >
                        Reply
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 text-center text-xs font-medium text-white bg-red-600 border-2 border-red-600 rounded-md px-3 py-2 hover:scale-105 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageQuery;
