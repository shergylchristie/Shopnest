import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";

const MAX_IMAGES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    stock: "",
  });

  const [imageSlots, setImageSlots] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    apiFetch(`/api/editproduct/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title,
          price: data.price,
          description: data.description,
          category: data.category,
          stock: data.stock,
        });

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
  }, [id, token]);

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

  const deleteExisting = (index) => {
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
    formdata.append("title", form.title);
    formdata.append("price", form.price);
    formdata.append("description", form.description);
    formdata.append("category", form.category);
    formdata.append("stock", form.stock);

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

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow space-y-4"
        >
          <h1 className="text-2xl font-bold">Edit Product</h1>

          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Price</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Category
            </label>
            <select
              name="category"
              value={form.category}
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
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Stock Status</label>
            <select
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="In-Stock">In Stock</option>
              <option value="Out-Of-Stock">Out Of Stock</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Images{" "}
              <span className="text-xs text-gray-500">(max 5, &lt; 5MB)</span>
            </label>

            <div className="flex flex-wrap gap-3 mt-2">
              {imageSlots.map((img) => (
                <div
                  key={img.index}
                  className={`relative w-16 h-16 border rounded ${
                    img.deleted ? "opacity-40" : ""
                  }`}
                >
                  <img
                    src={img.preview || img.url}
                    className="w-full h-full object-contain rounded"
                  />
                  {img.deleted ? (
                    <button
                      type="button"
                      onClick={() =>
                        setImageSlots((prev) =>
                          prev.map((i) =>
                            i.index === img.index ? { ...i, deleted: false } : i
                          )
                        )
                      }
                      className="absolute top-0 right-0 bg-white text-[10px] px-1 rounded"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => deleteExisting(img.index)}
                      className="absolute top-0 right-0 bg-white text-xs px-1 rounded"
                    >
                      ✕
                    </button>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => replaceImage(img.index, e.target.files[0])}
                    className="absolute inset-0 opacity-0"
                  />
                </div>
              ))}

              {newImages.map((img, i) => (
                <div key={i} className="w-16 h-16 border rounded">
                  <img
                    src={img.preview}
                    className="w-full h-full object-contain rounded"
                  />
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <label className="w-16 h-16 border-dashed border rounded flex items-center justify-center cursor-pointer">
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
          </div>

          <button
            disabled={saving}
            className="w-full bg-purple-600 text-white py-3 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
