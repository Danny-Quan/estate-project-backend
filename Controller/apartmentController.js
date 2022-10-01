const Apartment = require("./../Model/apartmentModel");
const APIFeatures = require("./../utils/apiFeatures");
const multer = require("multer");
const sharp = require("sharp");
const { countDocuments } = require("./../Model/apartmentModel");
const AppError = require("./../utils/appError");

// //uploading single image with multer
/*
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/apartments");
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(
      null,
      `apartment-${Date.now()}-${Math.round(Math.random() * 1000)}.${extension}`
    );
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("please select an image file"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadPhoto = upload.single("coverPhoto");
*/

//uploading multiple images
//UPLOADING IMAGES WITH MULTER
const multiplemulterStorage = multer.memoryStorage();
const multiplemulterFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! please upload only images", 400), false);
  }
};
const multipleupload = multer({
  storage: multiplemulterStorage,
  fileFilter: multiplemulterFilter,
});
exports.uploadApartmentImages = multipleupload.fields([
  { name: "coverPhoto", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
exports.resizeApartmentImages = async (req, res, next) => {
  //console.log(req.files.coverPhoto)
  //console.log(req.files.coverPhoto);
  if (!req.files.coverPhoto || !req.files.images) return next();
  if (!req.files.images) return next();
  // console.log(req.files);
  //1) COVER IMAGE
  const imageCoverFilename = `apartment-${
    res.user.id
  }-${Date.now()}-cover.jpeg`;
  await sharp(req.files.coverPhoto[0].buffer)
    .resize(1750, 1200)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/apartments/${imageCoverFilename}`);
  req.body.coverPhoto = imageCoverFilename;

  // 2) IMAGES
  req.body.images = [];
  await Promise.all(
    req.files.images.split(",").map(async (file, i) => {
      const filename = `apartment-${res.user.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(1920, 1200)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/apartments/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
};

exports.createApartment = async (req, res, next) => {
  try {
    // if (req.files) {
    //   req.body.coverPhoto = req.file.filename;
    // }
    console.log(req.body);
    const apartment = await Apartment.create({
      user: res.user.id,
      ...req.body,
    });

    res.status(200).json({
      status: "success",
      apartment,
    });
  } catch (error) {
    // res.status(400).send({
    //   message: error.message,
    // });
    next(error);
  }
};

exports.topApartments = (req, res, next) => {
  req.query.limit = "6";
  req.query.sort = "-rating,price";
  next();
};

exports.allDbData = async (req, res, next) => {
  try {
    const dbData = await Apartment.find({ user: res.user.id });
    if (!dbData) return next(new AppError("no data found", 404));
    res.status(200).json({
      length: dbData.length,
      dbData,
    });
  } catch (err) {
    // res.status(404).send({
    //   message: err.message,
    // });
    next(err);
  }
};
exports.allRented = async (req, res) => {
  try {
    const rented = await Apartment.find({ rented: true, user: res.user.id });
    res.status(200).json({
      length: rented.length,
    });
  } catch (err) {
    res.status(404).send({
      message: err.message,
    });
  }
};

exports.updateApartment = async (req, res, next) => {
  try {
    if (req.body.files) {
      req.body.images = req.files.filename;
    }
    console.log(req.body.images);
    // req.body.images = req.body.images.split(",");
    const updatedApartment = await Apartment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedApartment)
      return next(new AppError("Apartment with this ID no found", 404));
    res.status(200).json({
      status: "success",
      updatedApartment,
    });
  } catch (error) {
    // res.status(404).send({
    //   message: error.message,
    // });
    next(error);
  }
};

exports.singleApartments = async (req, res, next) => {
  try {
    const apartment = await Apartment.findById(req.params.id).populate({
      path: "user",
      select: "contact1 contact2",
    });
    if (!apartment) return next(new AppError("apartment not found", 404));
    res.status(200).json({
      status: "success",
      apartment,
    });
  } catch (error) {
    // res.status(404).send({
    //   message: error.message,
    // });
    next(error);
  }
};
exports.allApartments = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Apartment.find({ rented: false }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const apartments = await features.query;
    const newFeatures = new APIFeatures(
      Apartment.find({ rented: false }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
    const count = await newFeatures.query.countDocuments();
    if (!apartments) return next(new AppError("no apartment found", 500));
    res.status(200).json({
      status: "success",
      apartments,
      total: Math.ceil(count / 9),
    });
  } catch (error) {
    // res.status(500).send({
    //   message: error.message,
    // });
    next(error);
  }
};
exports.showAdminApartments = async (req, res) => {
  try {
    req.query.limit = "15";
    const features = new APIFeatures(
      Apartment.find({ rented: false, user: res.user.id }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const apartments = await features.query;
    if (!apartments) return next(new AppError("apartment not found", 500));
    res.status(200).json({
      status: "success",
      apartments,
    });
  } catch (error) {
    // res.status(500).send({
    //   message: error.message,
    // });
    next(error);
  }
};
exports.deleteApartment = async (req, res, next) => {
  try {
    const deletedApartment = await Apartment.findByIdAndDelete(req.params.id);
    if (!deletedApartment)
      return next(new AppError("apartment with this ID not found"));
    res.status(203).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    // res.status(404).send({
    //   message: error.message,
    // });
    next(error);
  }
};
