const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

//Load model
require("./models/User");
require("./models/Story");

//passport config
require("./config/passport")(passport);

//Load routes
const auth = require("./routes/auth");
const index = require("./routes/index");
const stories = require("./routes/stories");

//Load Keys
const keys = require("./config/keys");

//Handlebars Helpers
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon,
} = require("./helper/helpforhandle");

//MAp globle promises
mongoose.Promise = global.Promise;

//Mongoose connect
mongoose
  .connect(keys.mongoURI, {
    //useMongoClient: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

const app = express();

//Middleware Body-Parser

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Middleware for method-override
app.use(methodOverride("_method"));

//Middleware of handlebars
app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate: truncate,
      stripTags: stripTags,
      formatDate: formatDate,
      select: select,
      editIcon: editIcon,
    },
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

//Middleware for cookie and session should be before auth
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Set globle variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Use routes
app.use("/auth", auth);
app.use("/", index);
app.use("/stories", stories);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
