const QueryCollection = require("../models/query");
const ProductCollection = require("../models/product");
const fs = require("fs").promises;
const path = require("path");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

function extractCloudinaryPublicId(urlOrId) {
  try {
    if (!urlOrId || typeof urlOrId !== "string") return null;

    // If it's a plain-looking public id (no host) and doesn't look like a filename with extension, return it
    if (
      !urlOrId.includes("res.cloudinary.com") &&
      !urlOrId.startsWith("http")
    ) {
      // treat strings containing a dot (.) as filenames and not public ids
      if (urlOrId.includes(".")) return null;
      return urlOrId;
    }

    // For full URLs (or other strings), try to extract the path after /upload/
    let pathname = urlOrId;
    try {
      const u = new URL(urlOrId);
      pathname = u.pathname;
    } catch (e) {
      // not a full URL, keep original string
      pathname = urlOrId;
    }

    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let publicPath = pathname.slice(uploadIndex + "/upload/".length);

    // remove version prefix at start like v123456789/ (or v123456789)
    publicPath = publicPath.replace(/^v\d+\/?/, "");

    // Trim leading slashes
    publicPath = publicPath.replace(/^\/+/, "");

    // Remove extension and any query string
    publicPath = publicPath.split("?")[0].replace(/\.[^/.]+$/, "");

    return publicPath || null;
  } catch (err) {
    return null;
  }
}

// Helper to delete an array of cloudinary public ids
async function deleteCloudinaryResources(publicIds = []) {
  if (!Array.isArray(publicIds) || publicIds.length === 0) return;

  for (const pid of publicIds) {
    if (!pid) continue;
    try {
      const destroyRes = await cloudinary.uploader.destroy(pid, {
        resource_type: "image",
        invalidate: true,
      });
      console.log("Cloudinary destroy result for", pid, destroyRes);
    } catch (err) {
      console.error("Cloudinary deletion error for", pid, err);
    }
  }
}

const showQueryController = async (req, res) => {
  const id = req.params.id;
  try {
    if (id) {
      const queryEmail = await QueryCollection.findById(id);
      res.json(queryEmail);
    } else {
      const queryData = await QueryCollection.find();
      res.json(queryData);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteQueryController = async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await QueryCollection.findByIdAndDelete(id);
    if (deleted) {
      res.status(200).json({ message: "Deleted Successfully" });
    } else res.status(400).json({ message: "Something went wrong" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const addProductController = async (req, res) => {
  try {
    const { title, price, description, category } = req.body;
    const files = req.files;

    if (!title || !price || !description || !category) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    if (!files || !files.length) {
      console.error(
        "addProductController: no files received. req.files:",
        files
      );
      return res.status(400).json({
        message: "Please upload at least one image. (Upload may have failed)",
      });
    }

    const images = files.map((file) => file.path);
    const imagesPublicIds = files
      .map((file) => file.filename || extractCloudinaryPublicId(file.path))
      .filter(Boolean);

    const record = new ProductCollection({
      title: title,
      price: price,
      description: description,
      category: category,
      image: images[0],
      images: images,
      imagePublicId: imagesPublicIds[0] || "",
      imagesPublicIds: imagesPublicIds,
    });

    await record.save();
    // Return the saved product (including public ids) so frontend can show confirmation
    return res
      .status(200)
      .json({ message: "Product Added Successfully", product: record });
  } catch (error) {
    console.error("addProductController error:", error);
    console.error("addProductController req.body:", req.body);
    console.error("addProductController req.files:", req.files);

    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getProductController = async (req, res) => {
  const id = req.params.id;
  try {
    if (id) {
      const singleproductdata = await ProductCollection.findById(id);
      res.json(singleproductdata);
    } else {
      const productdata = await ProductCollection.find();
      res.json(productdata);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await ProductCollection.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Collect public ids from the document if available
    const publicIds = [];
    if (product.imagePublicId) publicIds.push(product.imagePublicId);
    if (Array.isArray(product.imagesPublicIds)) {
      for (const pid of product.imagesPublicIds) {
        if (pid && !publicIds.includes(pid)) publicIds.push(pid);
      }
    }

    // Delete Cloudinary resources by public id
    for (const pid of publicIds) {
      try {
        const destroyRes = await cloudinary.uploader.destroy(pid, {
          resource_type: "image",
          invalidate: true,
        });
        console.log("Cloudinary destroy result for", pid, destroyRes);
      } catch (err) {
        console.error("Cloudinary deletion error for", pid, err);
      }
    }

    // Fallback: delete any local files referenced by URL/path in product.image or product.images
    const filename = product.image;
    if (filename) {
      try {
        const filePath = path.resolve(UPLOAD_DIR, filename);
        if (filePath.startsWith(UPLOAD_DIR)) {
          await fs.unlink(filePath).catch((err) => {
            if (err.code !== "ENOENT") console.error(err);
          });
        }
      } catch (err) {
        console.error("Local file deletion error:", err);
      }
    }

    if (Array.isArray(product.images)) {
      for (const img of product.images) {
        if (!img || img === filename) continue;
        try {
          const filePath = path.resolve(UPLOAD_DIR, img);
          if (filePath.startsWith(UPLOAD_DIR)) {
            await fs.unlink(filePath).catch((err) => {
              if (err.code !== "ENOENT") console.error(err);
            });
          }
        } catch (err) {
          console.error("Local file deletion error:", err);
        }
      }
    }

    await ProductCollection.findByIdAndDelete(id);

    return res.status(200).json({ message: "Product Deleted Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const editProductController = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await ProductCollection.findById(id);
    const { title, price, description, category, stock } = req.body;
    const files = req.files || [];
    const replaceImages =
      req.body.replaceImages === "true" || req.body.replaceImages === true;

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (title !== undefined) product.title = title;
    if (price !== undefined) product.price = price;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

    // Optional: remove specific public ids sent from client
    if (req.body.removePublicIds) {
      let removePublicIds = [];
      try {
        removePublicIds = JSON.parse(req.body.removePublicIds);
      } catch (e) {
        console.warn("Could not parse removePublicIds", e);
      }

      if (Array.isArray(removePublicIds) && removePublicIds.length) {
        try {
          await module.exports.deleteCloudinaryResources(removePublicIds);
        } catch (err) {
          console.error("Error deleting specified cloudinary resources:", err);
        }

        for (const pid of removePublicIds) {
          const idx = (product.imagesPublicIds || []).indexOf(pid);
          if (idx !== -1) {
            product.imagesPublicIds.splice(idx, 1);
            if (Array.isArray(product.images) && product.images[idx])
              product.images.splice(idx, 1);
          }

          if (product.imagePublicId === pid) {
            product.imagePublicId = "";
            product.image = product.images?.[0] || "";
          }
        }
      }
    }

    if (files.length) {
      const newImages = files.map((file) => file.path);
      const newImagePublicIds = files
        .map((file) => file.filename || extractCloudinaryPublicId(file.path))
        .filter(Boolean);

      if (replaceImages) {
        // Delete existing Cloudinary resources if any
        const existingPublicIds = [];
        if (product.imagePublicId)
          existingPublicIds.push(product.imagePublicId);
        if (Array.isArray(product.imagesPublicIds)) {
          for (const pid of product.imagesPublicIds) {
            if (pid && !existingPublicIds.includes(pid))
              existingPublicIds.push(pid);
          }
        }
        if (existingPublicIds.length) {
          try {
            await module.exports.deleteCloudinaryResources(existingPublicIds);
          } catch (err) {
            console.error(
              "Error deleting existing cloudinary resources during replace:",
              err
            );
          }
        }

        // Also attempt local file deletion for any local paths
        if (product.image) {
          try {
            const filePath = path.resolve(UPLOAD_DIR, product.image);
            if (filePath.startsWith(UPLOAD_DIR)) {
              await fs.unlink(filePath).catch((err) => {
                if (err.code !== "ENOENT") console.error(err);
              });
            }
          } catch (err) {
            console.error("Local file deletion error:", err);
          }
        }

        if (Array.isArray(product.images)) {
          for (const img of product.images) {
            if (!img || img === product.image) continue;
            try {
              const filePath = path.resolve(UPLOAD_DIR, img);
              if (filePath.startsWith(UPLOAD_DIR)) {
                await fs.unlink(filePath).catch((err) => {
                  if (err.code !== "ENOENT") console.error(err);
                });
              }
            } catch (err) {
              console.error("Local file deletion error:", err);
            }
          }
        }

        // Replace arrays with new images
        product.images = newImages;
        product.imagesPublicIds = newImagePublicIds;
        product.image = newImages[0] || product.image;
        product.imagePublicId = newImagePublicIds[0] || "";
      } else {
        // Append behavior
        product.images = [...(product.images || []), ...newImages];
        product.imagesPublicIds = [
          ...(product.imagesPublicIds || []),
          ...newImagePublicIds,
        ];

        if (!product.image) {
          product.image = newImages[0];
        }

        if (!product.imagePublicId && newImagePublicIds.length) {
          product.imagePublicId = newImagePublicIds[0];
        }
      }
    }

    await product.save();

    return res.status(200).json({ message: "Details Updated Successfully" });
  } catch (error) {
    console.error("editProductController error:", error);
    console.error("editProductController req.body:", req.body);
    console.error("editProductController req.files:", req.files);

    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getReplyData = async (req, res) => {
  try {
    const { to, sub, reply, query } = req.body;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "shergyljchristie@gmail.com",
        pass: "ezwx tknv gwvp crfg",
      },
    });

    const info = transporter.sendMail({
      from: '"ChristieTech" <shergyljchristie@gmail.com>',
      to: to,
      subject: sub,
      text: `${reply}\n\n---\nOriginal query:\n${query}`,
      html: `<div style="font-family:Arial,sans-serif; font-size: 16px">
      <p>${reply}</p>
      <br/>
      <p><strong>Original query:</strong></p>
      <blockquote>${query}</blockquote>
    </div>
  `,
    });
    if (info) {
      res.status(200).json({ message: "Replied Successfully" });
    } else res.status(400).json({ message: "Something went wrong" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  showQueryController,
  deleteQueryController,
  addProductController,
  getProductController,
  deleteProductController,
  editProductController,
  getReplyData,
};
