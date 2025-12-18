import React, { useEffect, useState } from "react";
import Slidebar from "../admin/Slidebar";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import { apiFetch } from "../apiClient";

const ManageProducts = () => {
  const [products, setProduct] = useState([]);
  const token = localStorage.getItem("token");
  console.log(token);

  async function handleGetProducts() {
    const response = await apiFetch("/api/getproducts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(result);
    const result = await response.json();
    setProduct(result);
  }

  async function handleDelete(id) {
    try {
      const response = await apiFetch(`/api/deleteproduct/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        handleGetProducts();
      } else toast.error(result.message);
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    handleGetProducts();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <Slidebar />
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-20 md:pt-6 p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="md:text-4xl text-lg font-bold font-mono">
            Manage Products
          </h1>
          <Link
            to={"/admin/addProducts"}
            className="md:px-5 md:py-2 px-2 py-1 text-xs text-white bg-green-600 hover:scale-105 rounded-md"
          >
            Add Products
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((value, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-sm shadow-lg p-1 md:p-5 flex flex-col h-full"
              >
                <img
                  src={`/uploads/${value.image}`}
                  alt="Product"
                  className="w-full h-20 md:h-40 rounded-sm object-contain"
                />

                <div className="space-y-2 md:space-y-3 mt-2 flex-1">
                  <h1 className="text-xs md:text-lg">{value.title}</h1>
                  <h2 className="text-xs md:text-lg font-normal">
                    ₹ {value.price}
                  </h2>
                  <p
                    className={
                      "font-semibold text-sm md:text-lg " +
                      (value.stock == "Out-Of-Stock"
                        ? "text-red-600"
                        : "text-green-700")
                    }
                  >
                    {value.stock}
                  </p>
                  <p className="font-normal text-xs text-white bg-blue-300 rounded-md inline-block px-2 py-1">
                    {value.category}
                  </p>
                </div>

                <div className="flex justify-between mt-3 md:mt-4">
                  <Link
                    to={`/admin/editProduct/${value._id}`}
                    className="flex text-lg md:text-3xl bg-slate-200 rounded-md p-1"
                    title="Edit"
                  >
                    <MdEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(value._id)}
                    className="flex text-lg md:text-3xl text-red-500 bg-slate-200 rounded-md p-1"
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="col-span-full text-center text-gray-500 mt-8">
            No products available.
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
