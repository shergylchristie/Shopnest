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
        headers: { Authorization: `Bearer ${token}` },
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

  const activeExistingCount = imageSlots.filter(
    (img) => !img.isDeleted || img.replacementFile
  ).length;

  const totalImages = activeExistingCount + newImages.length;

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
    if (!file || file.size > MAX_SIZE) {
      toast.error("Image must be under 5MB");
      return;
    }

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
      {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      },
    ]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (totalImages === 0) {
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

    newImages.forEach((img) => {
      formdata.append("images", img.file);
    });

    try {
      const response = await apiFetch(`/api/updateproduct/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
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

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-gray-50">
      <div className="flex flex-col lg:flex-row w-full mt-9 md:mt-1">
        <Slidebar />

        <div className="flex-1 overflow-y-auto scrollbar-hide pt-7 md:pt-6 p-4 md:p-6">
          <h1 className="text-lg md:text-4xl mb-6 font-bold font-mono">
            Edit Product
          </h1>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="bg-white rounded shadow p-4 md:p-6 space-y-6 w-full md:max-w-full"
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
              <label className="block mb-1 font-semibold">Images</label>
              <p className="text-xs text-gray-500 mb-2">
                Max 5 images allowed · Image size &lt; 5MB
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imageSlots.map((img) => (
                  <div
                    key={`existing-${img.index}`}
                    className={`relative rounded border p-1 ${
                      img.isDeleted ? "opacity-40" : ""
                    }`}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded">
                      <img
                        src={img.replacementPreview || img.url}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {!img.isDeleted ? (
                      <button
                        type="button"
                        onClick={() => markDelete(img.index)}
                        className="absolute top-1 right-1 text-xs bg-white rounded-full px-1 text-red-600"
                      >
                        ✕
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => undoDelete(img.index)}
                        className="absolute top-1 right-1 text-xs bg-white rounded-full px-1 text-green-600"
                      >
                        ↺
                      </button>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        replaceImage(img.index, e.target.files[0])
                      }
                      className="mt-1 w-full text-[10px]"
                    />
                  </div>
                ))}

                {newImages.map((img, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative rounded border p-1"
                  >
                    <div className="aspect-square w-full overflow-hidden rounded">
                      <img
                        src={img.preview}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 text-xs bg-white rounded-full px-1 text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {totalImages < MAX_IMAGES && (
                  <label className="flex items-center justify-center aspect-square border-dashed border rounded cursor-pointer text-xs text-gray-500">
                    + Add
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
