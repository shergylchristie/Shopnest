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
    images: [],
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deleteIndexes, setDeleteIndexes] = useState([]);
  const [replaceMap, setReplaceMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);


  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (product?.images?.length) {
      setExistingImages(product.images.map((url, index) => ({ url, index })));
    }
  }, [product]);

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
    } catch (error) {
      toast.error("Failed to load product");
    }
  }

  useEffect(() => {
    handlegetEditData();
  }, []);

  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  const handleDeleteImage = (index) => {
    setDeleteIndexes((prev) =>
      prev.includes(index) ? prev : [...prev, index]
    );

    setExistingImages((prev) => prev.filter((img) => img.index !== index));

    setReplaceMap((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleReplaceImage = (index, file) => {
    setReplaceMap((prev) => ({
      ...prev,
      [index]: file,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (existingImages.length === 0) {
      toast.error("At least one image is required");
      return;
    }

    setIsSaving(true);

    const formdata = new FormData();

    formdata.append("title", product.title);
    formdata.append("price", product.price);
    formdata.append("description", product.description);
    formdata.append("category", product.category);
    formdata.append("stock", product.stock);

    deleteIndexes.forEach((i) => {
      formdata.append("deleteIndexes", i);
    });

    Object.entries(replaceMap).forEach(([index, file]) => {
      formdata.append("replaceIndexes", index);
      formdata.append("images", file);
    });

    try {
      const response = await apiFetch(`/api/updateproduct/${id}`, {
        method: "PUT",
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
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  }


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
            <input
              type="text"
              name="title"
              value={product.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />

            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
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

            <select
              name="stock"
              value={product.stock}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Out-Of-Stock">Out-Of-Stock</option>
              <option value="In-Stock">In-Stock</option>
            </select>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {existingImages.map(({ url, index }) => (
                <div key={index} className="border p-2 relative">
                  <img src={url} className="h-32 w-full object-contain" />

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-1 right-1 text-red-600"
                  >
                    ✕
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleReplaceImage(index, e.target.files[0])
                    }
                    className="mt-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className={`w-full font-semibold py-3 rounded text-white ${
                isSaving
                  ? "bg-purple-300 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
