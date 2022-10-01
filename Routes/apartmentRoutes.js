const express = require("express");
const router = express.Router();
const apartmentController = require("./../Controller/apartmentController");
const authController = require("./../Controller/authController");

router.route("/allApartments").get(apartmentController.allApartments);
router
  .route("/topApartments")
  .get(apartmentController.topApartments, apartmentController.allApartments);
router.route("/apartment/:id").get(apartmentController.singleApartments);

router.use(authController.protected);
router.route("/allRented").get(apartmentController.allRented);
router.route("/allDbData").get(apartmentController.allDbData);
router.route("/adminApartments").get(apartmentController.showAdminApartments);
router
  .route("/apartment")
  .post(
    apartmentController.uploadApartmentImages,
    apartmentController.resizeApartmentImages,
    apartmentController.createApartment
  );
router
  .route("/apartment/:id")
  .patch(
    apartmentController.uploadApartmentImages,
    apartmentController.resizeApartmentImages,
    apartmentController.updateApartment
  );
router.route("/apartment/:id").delete(apartmentController.deleteApartment);
module.exports = router;
