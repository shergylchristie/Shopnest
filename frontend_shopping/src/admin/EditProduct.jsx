import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";

const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

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
  const [saving, setSaving] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    apiFetch(`/api/editproduct/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setImageSlots(
          data.images.map((url, index) => ({
            index,
            url,
            deleted: false,
            replacement: null,
            preview: null,
          }))
        );
      });
  }, []);

  const totalImages =
    imageSlots.filter((i) => !i.deleted || i.replacement).length +
    newImages.length;

  const replaceImage = (index, file) => {
    if (!file || file.size > MAX_SIZE) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImageSlots((prev) =>
      prev.map((img) =>
        img.index === index
          ? {
              ...img,
              deleted: false,
              replacement: file,
              preview: URL.createObjectURL(file),
            }
          : img
      )
    );
  };

  const markDelete = (index) => {
    setImageSlots((prev) =>
      prev.map((img) => (img.index === index ? { ...img, deleted: true } : img))
    );
  };

  const addNewImage = (file) => {
    if (!file || file.size > MAX_SIZE) {
      toast.error("Image must be under 5MB");
      return;
    }

    if (totalImages >= MAX_IMAGES) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setNewImages((prev) => [
      ...prev,
      { file, preview: URL.createObjectURL(file) },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (totalImages === 0) {
      toast.error("At least one image is required");
      return;
    }

    setSaving(true);

    const formdata = new FormData();
    formdata.append("title", product.title);
    formdata.append("price", product.price);
    formdata.append("description", product.description);
    formdata.append("category", product.category);
    formdata.append("stock", product.stock);

    imageSlots.forEach((img) => {
      if (img.deleted && !img.replacement) {
        formdata.append("deleteIndexes", img.index);
      }
      if (img.replacement) {
        formdata.append("replaceIndexes", img.index);
        formdata.append("replaceImages", img.replacement);
      }
    });

    newImages.forEach((img) => {
      formdata.append("newImages", img.file);
    });

    const res = await apiFetch(`/api/updateproduct/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formdata,
    });

    const result = await res.json();

    if (res.ok) {
      toast.success(result.message);
      navigate("/admin/manageProducts");
    } else {
      toast.error(result.message);
    }

    setSaving(false);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <Slidebar />
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Edit Product</h1>

          <select
            name="stock"
            value={product.stock}
            onChange={(e) => setProduct({ ...product, stock: e.target.value })}
            className="border p-2 mb-4 w-full"
          >
            <option value="">--SELECT STOCK--</option>
            <option value="In-Stock">In Stock</option>
            <option value="Out-Of-Stock">Out Of Stock</option>
          </select>

          <div className="flex flex-wrap gap-3 mb-4">
            {imageSlots.map((img) => (
              <div
                key={img.index}
                className={`relative w-20 h-20 border rounded ${
                  img.deleted ? "opacity-40" : ""
                }`}
              >
                <img
                  src={img.preview || img.url}
                  className="w-full h-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => markDelete(img.index)}
                  className="absolute top-1 right-1 bg-white text-xs px-1 rounded"
                >
                  ✕
                </button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => replaceImage(img.index, e.target.files[0])}
                  className="mt-1 w-full text-[10px]"
                />
              </div>
            ))}

            {newImages.map((img, i) => (
              <div key={i} className="w-20 h-20 border rounded">
                <img
                  src={img.preview}
                  className="w-full h-full object-contain rounded"
                />
              </div>
            ))}

            {totalImages < MAX_IMAGES && (
              <label className="w-20 h-20 border-dashed border rounded flex items-center justify-center cursor-pointer">
                +
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => addNewImage(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <button
            disabled={saving}
            className="w-full bg-purple-600 text-white py-3 rounded"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
