import React, { useEffect, useState } from "react";
import Slidebar from "./Slidebar";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiFetch } from "../apiClient";
import { IoIosClose } from "react-icons/io";
import { FaUndo } from "react-icons/fa";

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

  const totalImages = imageSlots.length + newImages.length;


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

      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <div className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-6">
          <h1 className="text-lg md:text-4xl mb-4 md:mb-8 font-bold font-mono">
            Edit Product
          </h1>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="max-w-screen mx-auto p-6 bg-white rounded shadow space-y-6"
          >
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Price
              </label>
              <input
                type="number"
                onWheel={(e) => e.target.blur()}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
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
              <label className="block text-gray-700 font-semibold mb-2">
                Stock Status
              </label>
              <select
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="In-Stock">In Stock</option>
                <option value="Out-Of-Stock">Out Of Stock</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Images
              </label>

              <div className="flex flex-wrap gap-3 mb-2">
                {imageSlots.map((img) => (
                  <div
                    key={img.index}
                    className={`relative w-24 h-24 border rounded overflow-hidden ${
                      img.deleted ? "opacity-40" : ""
                    }`}
                  >
                    <img
                      src={img.preview || img.url}
                      className="w-full h-full object-contain"
                    />

                    {img.deleted ? (
                      <button
                        type="button"
                        onClick={() =>
                          setImageSlots((prev) =>
                            prev.map((i) =>
                              i.index === img.index
                                ? { ...i, deleted: false }
                                : i
                            )
                          )
                        }
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                      >
                        <FaUndo />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => deleteExisting(img.index)}
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                      >
                        <IoIosClose />
                      </button>
                    )}

                    <button
                      type="button"
                      className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] py-[2px] rounded cursor-pointer"
                    >
                      Replace
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          replaceImage(img.index, e.target.files[0])
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </button>
                  </div>
                ))}

                {newImages.map((img, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 border rounded overflow-hidden"
                  >
                    <img
                      src={img.preview}
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setNewImages((prev) =>
                          prev.filter((_, idx) => idx !== i)
                        )
                      }
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                    >
                      <IoIosClose />
                    </button>
                  </div>
                ))}

                {totalImages < MAX_IMAGES && (
                  <label className="w-24 h-24 border-dashed border-2 rounded flex items-center justify-center text-xs cursor-pointer">
                    +
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => addNewImage(e.target.files[0])}
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
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;
