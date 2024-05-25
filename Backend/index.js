import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import oppo from "./models/opportunities.model.js";
import editorial from "./models/editorials.model.js";
import leetcode from "./models/Leetcode.model.js";
import gfg from "./models/gfg.model.js";
import upcontest from "./models/upcontests.model.js";
import talks from "./models/talks.model.js";
import UserModel from "./Data/Login.js";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 
dotenv.config();
const allowedOrigins = ["http://localhost:5174", "http://localhost:5173", "https://algozenith-nitc-codingclub.vercel.app", "https://algozenith-nitc-codingclub-admin.vercel.app"];
// CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
// mongoose.connect("mongodb://localhost:27017/algo");
// mongoose.connect("mongodb+srv://algozenith:nitc@cluster0.pknc4ob.mongodb.net/algozenith?retryWrites=true&w=majority", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
//   socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
//   family: 4 
// }).then(() => console.log('Database connected successfully'))
// .catch(err => console.error('Database connection error:', err));
// mongoose.connect("mongodb://localhost:27017/algo");

//added dot env file 
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("db connected");
}).catch((err) => console.log(err))
/*** for login page ****/

// Create a transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rakesh.punugubati123@gmail.com", //add algo zenith email id
    pass: "qcgf vruc eqbx mrqp", // create a pass key and add here
  },
});
// Function to send password email
function sendPasswordEmail(password, recipient) {
  // Create the email options
  const mailOptions = {
    from: "rakesh.punugubati123@gmail.com", //add algo mail here
    to: recipient, //
    subject: "Your Password",
    text: `Your password is: ${password}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error occurred:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}
app.get("/", (req,res) => {
  res.send("working");
})
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  console.log("logout successful");
  res.json({ message: "Logout successful" });
});

app.post("/login", (req, res) => {
  const { type, data } = req.body;
  if (type === "handleSubmit") {
    const { email, password } = data;
    console.log(email, password);
    UserModel.findOne({ email, password })
      .then(function (user) {
        if (user) {
          const accessToken = jwt.sign(
            { email: email },
            "jwt-access-token-secret-key",
            { expiresIn: "2h" } // Access token expires in 2 hours
          );
          const refreshToken = jwt.sign(
            { email: email },
            "jwt-refresh-token-secret-key",
            { expiresIn: "30d" } // Refresh token expires in 30 days
          );

          res.cookie("accessToken", accessToken, { maxAge: 2 * 60 * 60 * 1000 }); // 2 hours in milliseconds

          res.cookie("refreshToken", refreshToken, {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
            httpOnly: true,
            secure: true,
            sameSite: "strict",
          });
          res.json({ message: "Valid user" });
        } else {
          res.json({ message: "Invalid user" });
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).send("Error occurred");
      });
  } else if (type === "togglepopup") {
    const { checkEmail } = data;
    console.log(checkEmail);
    UserModel.findOne({ email: checkEmail })
      .then(function (user) {
        if (user) {
          sendPasswordEmail(user.password, checkEmail);
          res.json({ message: "Valid user" });
        } else {
          res.json({ message: "Invalid user" });
        }
      })
      .catch(function (err) {
        console.log(err);
        res.status(500).send("Error occurred");
      });
  }
});

const verfyUser = (req, res, next) => {
  const accesstoken = req.cookies.accessToken;
  if (!accesstoken) {
    if (renewToken(req, res)) {
      next();
    }
  } else {
    jwt.verify(accesstoken, "jwt-access-token-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Token" });
      } else {
        req.email = decoded.email;
        next();
      }
    });
  }
};

const renewToken = (req, res) => {
  const refreshtoken = req.cookies.refreshToken;
  let exist = false;
  if (!refreshtoken) {
    return res.json({ valid: false, message: "No refresh token" });
  } else {
    jwt.verify(refreshtoken, "jwt-refresh-token-secret-key", (err, decoded) => {
      if (err) {
        return res.json({ valid: false, message: "Invalid Refresh Token" });
      } else {
        const accessToken = jwt.sign(
          { email: decoded.email },
          "jwt-access-token-secret-key",
          { expiresIn: "2h" } // Access token expires in 2 hours
        );
        res.cookie("accessToken", accessToken, { maxAge: 2 * 60 * 60 * 1000 }); // 2 hours in milliseconds
        exist = true;
      }
    });
  }
  return exist;
};

app.get("/admin", verfyUser, (req, res) => {
  return res.json({ valid: true, message: "authorized" });
});

app.post("/admin", async (req, res) => {
  const { formdata, formType } = req.body;
  if (formType === "leetcode") {
    const datenow = new Date();
    const dat = datenow.toDateString();
    const date = dat.substring(4);
    leetcode
      .findOne({ date: date })
      .then((found) => {
        if (found) {
          res.json("Question already exists");
        } else {
          leetcode
            .create({
              date: date,
              question: formdata.question,
              quesname: formdata.quesname,
              concept: formdata.concept,
              companies: formdata.companies,
              level: formdata.level,
              solution: formdata.solution,
              videolink: formdata.videolink,
            })
            .then(() => res.json("Posted"))
            .catch((err) => res.json("Error"));
        }
      })
      .catch((err) => res.json("Error"));
  } else if (formType === "gfg") {
    const datenow = new Date();
    const dat = datenow.toDateString();
    const date = dat.substring(4);
    gfg
      .findOne({ date: date })
      .then((found) => {
        if (found) {
          res.json("Question already exists");
        } else {
          gfg
            .create({
              date: date,
              question: formdata.question,
              quesname: formdata.quesname,
              concept: formdata.concept,
              companies: formdata.companies,
              level: formdata.level,
              solution: formdata.solution,
            })
            .then(() => res.json("Posted"))
            .catch((err) => res.json("Error"));
        }
      })
      .catch((err) => res.json("Error"));
  } else if (formType === "oppo") {
    await oppo.create({
      postdate: formdata.postdate,
      companyname: formdata.companyname,
      logo: formdata.logo,
      jobtype: formdata.jobtype,
      jobrole: formdata.jobrole,
      location: formdata.location,
      salary: formdata.salary,
      batch: formdata.batch,
      apply: formdata.apply,
    });
    res.json("opportunity posted");
  } else if (formType === "editorials") {
    await editorial.create({
      platformname: formdata.platformname,
      contestnumber: formdata.contestnumber,
      date: formdata.date,
      contestlink: formdata.contestlink,
      solutionlink: formdata.solutionlink,
    });
    res.json("editorial posted");
  } else if (formType === "upcontest") {
    await upcontest.create({
      upplatform: formdata.upplatform,
      contesttype: formdata.contesttype,
      update: formdata.update,
      uplink: formdata.uplink,
    });
    res.json("upcontest posted");
  }else if(formType === "Talks"){
    await talks.create({
      image: formdata.image,
      companylogo: formdata.companylogo,
      candidName: formdata.candidName,
      candidCourse: formdata.candidCourse,
      candidUniversity: formdata.candidUniversity,
      company: formdata.company,
      roleInCompany: formdata.roleInCompany,
      ctc: formdata.ctc,
      heading: formdata.heading,
      description: formdata.description,
      type: formdata.type,
      overview: formdata.overview,
      results: formdata.results,
    })
    res.json("talk posted");
  }
   else {
    console.error("Error in posting things");
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/admin", (req, res) => {
  const meta = req.body.meta;
  console.log(meta);
  if (meta === "leetcode") {
    const datenow = new Date();
    const dat = datenow.toDateString();
    const date = dat.substring(4);
    leetcode
      .deleteOne({ date: date })
      .then((result) => {
        if (result.deletedCount === 1) res.json("leetcode del");
        else res.json("Not posted leetcode potd yet");
      })
      .catch((err) => {
        console.error("Error occurred while deleting:", err);
        res.json({ error: "An error occurred while deleting data." });
      });
  } else if (meta === "gfg") {
    const datenow = new Date();
    const dat = datenow.toDateString();
    const date = dat.substring(4);
    gfg
      .deleteOne({ date: date })
      .then((result) => {
        if (result.deletedCount === 1) res.json("gfg del");
        else res.json("Not posted gfg potd yet");
      })
      .catch((err) => {
        console.error("Error occurred while deleting:", err);
        res.json({ error: "An error occurred while deleting data" });
      });
  } else if (meta === "oppo") {
    oppo
      .findOneAndDelete({}, { sort: { _id: -1 } })
      .then((latest) => {
        if (latest) {
          res.send("oppo del");
        } else {
          res.send("404 Error");
        }
      })
      .catch((error) => {
        console.error("Error occurred while deleting document:", error);
        res.send("Internal Server Error");
      });
  } else if (meta === "editorial") {
    editorial
      .findOneAndDelete({}, { sort: { _id: -1 } })
      .then((latest) => {
        if (latest) {
          res.send("editorial del");
        } else {
          res.send("404 Error");
        }
      })
      .catch((error) => {
        console.error("Error occurred while deleting document:", error);
        res.send("Internal Server Error");
      });
  } else if (meta === "upcoming") {
    upcontest
      .findOneAndDelete({}, { sort: { _id: -1 } })
      .then((latest) => {
        if (latest) {
          res.send("upcoming contest del");
        } else {
          res.send("404 Error");
        }
      })
      .catch((error) => {
        console.error("Error occurred while deleting document:", error);
        res.send("Internal Server Error");
      });
  } else if (meta === "expired") {
    const today = new Date().toISOString().slice(0, 10);
    console.log(today);
    upcontest
      .deleteMany({ update: { $lt: today } })
      .then((result) => {
        res.json("Success");
      }) 
      .catch((error) => {
        console.error(error);
        res.status(500).json("Error deleting records");
      });
  }
  else if(meta === "talks"){

  }
});

app.get("/gfg", async (req, res) => {
  try {
    const result = await gfg.find();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/leetcode", async (req, res) => {
  try {
    const result = await leetcode.find();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/opportunities", async (req, res) => {
  try {
    const out = await oppo.find();
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/editorials", async (req, res) => {
  try {
    const editdata = await editorial.find();
    res.json(editdata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/upcontest", async (req, res) => {
  try {
    const upcontestdata = await upcontest.find();
    res.json(upcontestdata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/talks", async (req,res) => {
  try {
    const alltalksdata = await talks.find();
    // console.log(alltalksdata);
    res.send(alltalksdata);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
})

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Server started");
});
