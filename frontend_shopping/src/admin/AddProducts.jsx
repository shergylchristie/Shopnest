import React, { useState } from "react";
import Slidebar from "./Slidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiClient";

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;

const AddProducts = () => {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
  });

  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  function handleImagesChange(e) {
    const selectedFiles = Array.from(e.target.files);

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = selectedFiles.filter((file) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${MAX_SIZE_MB}MB`);
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleForm(e) {
    e.preventDefault();

    if (
      !product.title ||
      !product.price ||
      !product.description ||
      !product.category
    ) {
      toast.error("All fields are required");
      return;
    }

    if (images.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    try {
      setSaving(true);

      const formdata = new FormData();
      formdata.append("title", product.title);
      formdata.append("price", product.price);
      formdata.append("description", product.description);
      formdata.append("category", product.category);

      images.forEach((file) => {
        formdata.append("images", file);
      });

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
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setSaving(false);
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
              <label className="block text-gray-700 font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                onWheel={(e) => e.target.blur()}
                value={product.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                rows="2"
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category
              </label>
              <select
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
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
              <label className="block text-gray-700 font-semibold mb-2">
                Images
              </label>

              <div className="flex flex-wrap gap-3 mb-2">
                {images.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 border rounded overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {images.length < MAX_IMAGES && (
                  <label className="w-20 h-20 border-dashed border-2 rounded flex items-center justify-center text-xs cursor-pointer">
                    +
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={handleImagesChange}
                    />
                  </label>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Max 5 images · Each image &lt; 5MB
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`w-full text-white font-semibold py-3 rounded ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;
