import React, { useState } from "react";
import Slidebar from "./Slidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiClient";


const AddProducts = () => {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [images, setImages] = useState([]);

  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  function handleImagesChange(e) {
    const selectedFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selectedFiles]);
  }

  async function handleForm(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("title", product.title);
    formdata.append("price", product.price);
    formdata.append("description", product.description);
    formdata.append("category", product.category);

    images.forEach((file) => {
      formdata.append("images", file);
    });

    try {
      const response = await apiFetch("/api/addproduct", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formdata,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message);
        navigate("/admin/manageProducts");
      } else toast.error(result.message);
    } catch (error) {
      toast.error(error);
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-6">
          <h1 className="text-lg md:text-4xl mb-4 md:mb-8 font-bold font-mono">
            Add Products
          </h1>

          <form
            onSubmit={handleForm}
            encType="multipart/form-data"
            className="max-w-screen mx-auto p-6 bg-white rounded shadow space-y-6"
          >
            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="price"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                onWheel={(e) => e.target.blur()}
                value={product.price}
                name="price"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="2"
              ></textarea>
            </div>

            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="category"
              >
                Category
              </label>
              <select
                id="category"
                value={product.category}
                name="category"
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">--SELECT--</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Mobile">Mobile</option>
                <option value="Footwear">Footwear</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
                <option value="Grocery">Grocery</option>
                <option value="Camera">Camera</option>
              </select>
            </div>

            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="image"
              >
                Image
              </label>
              <input
                id="image"
                type="file"
                name="images"
                multiple
                onChange={handleImagesChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="font-extralight text-sm text-end">
                Max file size 5MB
              </p>
              <div className="mt-2 space-y-1">
                {images.map((file, idx) => (
                  <p key={idx} className="text-xs text-gray-600">
                    {idx + 1}. {file.name}
                  </p>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded"
            >
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
