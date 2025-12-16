import React, { useState, useEffect } from "react";
import Slidebar from "./Slidebar";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../apiClient";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [previews, setPreviews] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [createdProduct, setCreatedProduct] = useState(null);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);
  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  function handleImagesChange(e) {
    const selectedFiles = Array.from(e.target.files);
    const ok = [];
    const bad = [];
    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        bad.push({ name: file.name, size: file.size });
      } else {
        ok.push(file);
      }
    });

    if (bad.length) {
      setRejected(bad);
      toast.error(`Some files were too large and were not added (max 5MB).`);
    } else {
      setRejected([]);
    }

    const newPreviews = ok.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
    setImages((prev) => [...prev, ...ok]);
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
      // Use XHR to get upload progress
      setUploading(true);
      setProgress(0);

      const xhr = new window.XMLHttpRequest();
      const base = import.meta.env.VITE_API_URL || "";
      xhr.open("POST", `${base}/api/addproduct`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setUploading(false);
        setProgress(0);
        try {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            toast.success(result.message || "Product added");
            setCreatedProduct(result.product || null);
            // clear selected images and previews
            previews.forEach((p) => URL.revokeObjectURL(p.url));
            setPreviews([]);
            setImages([]);
            // navigate to manage after brief pause
            setTimeout(() => navigate("/admin/manageProducts"), 900);
          } else {
            toast.error(result.message || "Upload failed");
          }
        } catch (e) {
          toast.error("Unexpected server response");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        setProgress(0);
        toast.error("Network error while uploading");
      };

      xhr.send(formdata);
    } catch (error) {
      setUploading(false);
      setProgress(0);
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
                Images
              </label>

              {/* previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {previews.map((p, idx) => (
                    <div key={idx} className="border rounded p-1 relative">
                      <img
                        src={p.url}
                        className="w-full h-20 object-contain"
                        alt={p.file.name}
                      />
                      <div className="text-xs mt-1 text-gray-600">
                        {p.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          // remove preview and file
                          setPreviews((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          setImages((prev) => prev.filter((_, i) => i !== idx));
                          URL.revokeObjectURL(p.url);
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
                {rejected.length > 0 && (
                  <p className="text-xs text-red-500">
                    {rejected.length} file(s) rejected (too large)
                  </p>
                )}
              </div>

              {uploading && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-green-500 h-2 rounded"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Uploading: {progress}%
                  </p>
                </div>
              )}

              {createdProduct && (
                <div className="mt-3 p-3 bg-green-50 border rounded">
                  <p className="text-sm font-medium">Uploaded successfully</p>
                  <p className="text-xs text-gray-600">
                    Main public_id: {createdProduct.imagePublicId || "(none)"}
                  </p>
                  <div className="text-xs text-gray-600">Other public_ids:</div>
                  <ul className="text-xs list-disc list-inside">
                    {(createdProduct.imagesPublicIds || []).map((pid, i) => (
                      <li key={i}>{pid}</li>
                    ))}
                  </ul>
                </div>
              )}
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
