import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";

const MAX_IMAGES = 5;

const EditProduct = () => {
  const [product, setProduct] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    images: [],
  });

  const [imageSlots, setImageSlots] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (product?.images?.length) {
      setImageSlots(
        product.images.map((url, index) => ({
          index,
          url,
          isDeleted: false,
          replacementFile: null,
          replacementPreview: null,
        }))
      );
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
    } catch {
      toast.error("Failed to load product");
    }
  }

  useEffect(() => {
    handlegetEditData();
  }, []);

  function handleChange(e) {
    setProduct({ ...product, [e.target.name]: e.target.value });
  }

  const markDelete = (index) => {
    setImageSlots((prev) =>
      prev.map((img) =>
        img.index === index
          ? {
              ...img,
              isDeleted: true,
              replacementFile: null,
              replacementPreview: null,
            }
          : img
      )
    );
  };

  const undoDelete = (index) => {
    setImageSlots((prev) =>
      prev.map((img) =>
        img.index === index ? { ...img, isDeleted: false } : img
      )
    );
  };

  const replaceImage = (index, file) => {
    const preview = URL.createObjectURL(file);
    setImageSlots((prev) =>
      prev.map((img) =>
        img.index === index
          ? {
              ...img,
              replacementFile: file,
              replacementPreview: preview,
              isDeleted: false,
            }
          : img
      )
    );
  };

  const addNewImage = (file) => {
    if (!file) return;
    setNewImages((prev) => [...prev, file]);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const remaining =
      imageSlots.filter((img) => !img.isDeleted || img.replacementFile).length +
      newImages.length;

    if (remaining === 0) {
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

    imageSlots.forEach((img) => {
      if (img.isDeleted && !img.replacementFile) {
        formdata.append("deleteIndexes", img.index);
      }
    });

    imageSlots.forEach((img) => {
      if (img.replacementFile) {
        formdata.append("replaceIndexes", img.index);
        formdata.append("images", img.replacementFile);
      }
    });

    newImages.forEach((file) => {
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
    } catch {
      toast.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  }

  const totalImages =
    imageSlots.filter((img) => !img.isDeleted || img.replacementFile).length +
    newImages.length;

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-6">
          <h1 className="text-lg md:text-4xl mb-6 font-bold font-mono">
            Edit Product
          </h1>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="bg-white rounded shadow p-6 space-y-6 max-w-full"
          >
            <div>
              <label className="block mb-1 font-semibold">Title</label>
              <input
                type="text"
                name="title"
                value={product.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Price</label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                name="description"
                value={product.description}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold">Category</label>
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
            </div>

            <div>
              <label className="block mb-1 font-semibold">Stock</label>
              <select
                name="stock"
                value={product.stock}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Out-Of-Stock">Out-Of-Stock</option>
                <option value="In-Stock">In-Stock</option>
              </select>
            </div>

            <div>
              <label className="block mb-3 font-semibold">Images</label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageSlots.map((img) => (
                  <div
                    key={img.index}
                    className={`border p-3 rounded relative ${
                      img.isDeleted ? "opacity-40" : ""
                    }`}
                  >
                    <img
                      src={img.replacementPreview || img.url}
                      className="h-32 w-full object-contain"
                    />

                    {!img.isDeleted ? (
                      <button
                        type="button"
                        onClick={() => markDelete(img.index)}
                        className="absolute top-1 right-1 text-red-600"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => undoDelete(img.index)}
                        className="absolute top-1 right-1 text-green-600"
                      >
                        Undo
                      </button>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        replaceImage(img.index, e.target.files[0])
                      }
                      className="mt-2 text-sm"
                    />
                  </div>
                ))}

                {totalImages < MAX_IMAGES && (
                  <label className="border-dashed border-2 flex items-center justify-center cursor-pointer rounded h-32">
                    <span className="text-sm text-gray-500">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => addNewImage(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
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
