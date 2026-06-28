// if(process.env.NODE_ENV!=="production"){
// 	require("dotenv").config();
// }
require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
    console.log("Development mode");
}

// console.log(process.env.CLOUD_NAME);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError.js");
// const { error } = require("console");
const session = require("express-session");
const flash = require("connect-flash");

// pass
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./Models/user.js");

const dbURl = process.env.ATLASDB_URL;
// console.log(dbURl);

const MongoStore = require("connect-mongo");

const store = MongoStore.create({
    mongoUrl: dbURl,
    collectionName: "sessions",
});

store.on("error", (err) => {
    console.log("Error in MONGO SESSION STORE", err);
});

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const hostRouter = require("./routes/host");
const adminRouter = require("./routes/admin");

app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

// sessions
app.use(
    session({
        name: "wanderstay.sid",
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        },
    })
);

// flash should come immediately after session
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// css
app.use(express.static(path.join(__dirname, "/public")));

// to call main fn
main()
    .then(() => {
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

// for creating db, we will write an async fn
// const mongoDB="mongodb://127.0.0.1:27017/WanderStay";

async function main() {
    await mongoose.connect(dbURl);
}

// app.get("/",(req,res)=>{
// 	res.send("Hi, I m a root");
// });
app.get("/", (req, res) => {
    res.redirect("/listings");
});
app.get("/test", (req, res) => {
    res.send("Working");
});
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.use("/host", hostRouter);
app.use("/admin", adminRouter);


app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// error handling
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // prevents crash
    }

    let { statusCode = 500, message = "Something went wrong!" } = err;

    res.status(statusCode).render("error.ejs", { message });

    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("server is listening to port 8080");
});