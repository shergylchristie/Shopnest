import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";

const EditProduct = () => {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });
  const [existingImages, setExistingImages] = useState([]); // { url, publicId }
  const [removedPublicIds, setRemovedPublicIds] = useState([]);
  const [replaceAll, setReplaceAll] = useState(false);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  async function handlegetEditData() {
    try {
      const response = await apiFetch(`/api/editproduct/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      setProduct(result);

      const existing = (result.images || []).map((url, idx) => ({
        url,
        publicId: result.imagesPublicIds?.[idx] || "",
      }));
      setExistingImages(existing);
    } catch (error) {
      toast.error(error);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("title", product.title);
    formdata.append("price", product.price);
    formdata.append("description", product.description);
    formdata.append("category", product.category);
    formdata.append("stock", product.stock);

    images.forEach((file) => {
      formdata.append("images", file);
    });

    try {
      setUploading(true);

      // attach removed public ids and replace flag
      if (removedPublicIds.length) {
        formdata.append("removePublicIds", JSON.stringify(removedPublicIds));
      }
      if (replaceAll) {
        formdata.append("replaceImages", "true");
      }

      const response = await apiFetch(`/api/updateproduct/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formdata,
      });
      const result = await response.json();
      setUploading(false);
      if (response.ok) {
        toast.success(result.message);
        navigate("/admin/manageProducts");
      } else toast.error(result.message);
    } catch (error) {
      setUploading(false);
      toast.error(error);
    }
  }

  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  function handleImagesChange(e) {
    const selectedFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...selectedFiles]);
  }

  useEffect(() => {
    handlegetEditData();
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-6">
          <h1 className="text-lg md:text-4xl mb-4 md:mb-8 font-bold font-mono">
            Edit Products
          </h1>
          <form
            onSubmit={handleSubmit}
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
                name="price"
                value={product.price}
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
                name="category"
                value={product.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
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
                htmlFor="stock"
              >
                Stock
              </label>
              <select
                id="stock"
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Out-Of-Stock">Out-Of-Stock</option>
                <option value="In-Stock">In-Stock</option>
              </select>
            </div>

            <div>
              <label
                className="block text-gray-700 font-semibold mb-2"
                htmlFor="image"
              >
                Images
              </label>

              {/* Existing images preview with remove option */}
              {existingImages.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="border rounded p-1 relative">
                      <img
                        src={img.url}
                        alt={`existing-${idx}`}
                        className="w-full h-20 object-contain"
                      />
                      <div className="text-xs mt-1 text-gray-600">
                        {img.publicId || "(no publicId)"}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // mark for removal
                          if (img.publicId)
                            setRemovedPublicIds((p) => [...p, img.publicId]);
                          setExistingImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded px-1 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                id="image"
                type="file"
                name="images"
                multiple
                onChange={handleImagesChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex items-center justify-between mt-1">
                <p className="font-extralight text-sm text-end">
                  Max file size 5MB
                </p>
                <label className="text-xs flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={replaceAll}
                    onChange={(e) => {
                      setReplaceAll(e.target.checked);
                      if (e.target.checked) {
                        setExistingImages([]);
                      }
                    }}
                  />
                  Replace all
                </label>
              </div>

              {images.length > 0 && (
                <div className="mt-2 space-y-1">
                  {images.map((file, idx) => (
                    <p key={idx} className="text-xs text-gray-600">
                      {idx + 1}. {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded ${
                uploading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
