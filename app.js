const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressErr");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const { listingSchema } = require("./schema.js");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));




app.get("/", (req, res) => {
  res.send("Hi, I am root");
});

//function to validate the listing
const validateListing = (req, res, next) => {
  let {error} = listingSchema.validate(req.body);
  if(error){
    let msg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, msg);
}else{
    next();
 }
};

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//new rout
app.get("/listings/new", (req, res) => {
  let listings = new Listing();
  res.render("listings/new.ejs" , {listings});
});



//Show Route
app.get("/listings/:id", wrapAsync( async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", 
  validateListing, 
  wrapAsync( async (req, res, next) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  console.log(newListing);
  console.log("new listing is created");
  res.redirect("/listings");
}));

//edit route
app.get("/listings/:id/edit", 
  wrapAsync (async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
  
}));

//update route
app.put("/listings/:id", 
  validateListing,
  wrapAsync( async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  console.log(req.body.listing);
  console.log("Updated successfully");
  res.redirect(`/listings/${id}`);
}));


//delete route
app.delete("/listings/:id", wrapAsync (async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  console.log("deleted successfully");
  res.redirect("/listings");
}));

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//error handling
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("listings/error.ejs", { message});
//   res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("server is on http://localhost:8080/listings");
});