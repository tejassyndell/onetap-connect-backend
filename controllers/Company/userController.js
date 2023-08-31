import connection from "../../db/db.js";
import { sendToken } from "../../utils/authToken.js";
import bcrypt from "bcryptjs";
import sendMail from "../../utils/sendMali.js";
import ErrorHandler from "../../utils/errorHandler.js";
import catchAsyncErrors from "../../middleware/catchAsyncErrors.js";

const executeQuery = (query, values) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

//--create company ----
export const CreateUser = catchAsyncErrors(async (req, res, next) => {
  const { userData, companyData, billAddress, shipAddress } = req.body;
  console.log();

  const selectCompanyQuery = "SELECT * FROM companies WHERE name = ?";
  const insertCompanyQuery =
    "INSERT INTO companies(`name`, `email`) VALUES (?, ?)";
  const insertUserQuery =
    "INSERT INTO users(`first_name`,`last_name`, `email`,`password`, `contact`, `company_id`) VALUES (?, ?, ?, ?, ?, ?)";
  const insertbillAddressQuery =
    "INSERT INTO billing_address(`address`, `address2`, `city`, `state`, `country` , `postal_code`, `company_id`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const insertshipAddressQuery =
    "INSERT INTO shipping_address(`address`, `address2`, `city`, `state`, `country` , `postal_code`, `company_id`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const findUserQuery =
    "SELECT u.id, u.first_name, u.last_name, u.email, u.contact, u.company_id, c.name AS company_name, r.role AS user_role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.id = ?";

  // Check if the company already exists
  const selectCompanyResult = await executeQuery(selectCompanyQuery, [
    companyData.name,
  ]);

  let companyId;
  if (selectCompanyResult.length > 0) {
    // Use the existing companyId
    companyId = selectCompanyResult[0].id;
  } else {
    // Insert the company
    const insertCompanyResult = await executeQuery(insertCompanyQuery, [
      companyData.name,
      companyData.email,
    ]);
    companyId = insertCompanyResult.insertId;

    const insertbillAddressResult = await executeQuery(insertbillAddressQuery, [
      billAddress.address,
      billAddress.address2,
      billAddress.city,
      billAddress.state,
      shipAddress.country,
      billAddress.postal_code,
      companyId,
    ]);

    // Insert the shipping address
    const insertshipAddressResult = await executeQuery(insertshipAddressQuery, [
      shipAddress.address,
      shipAddress.address2,
      shipAddress.city,
      shipAddress.state,
      shipAddress.country,
      shipAddress.postal_code,
      companyId,
    ]);
  }

  const hasedPassword = await bcrypt.hash(userData.password, 10);

  // Insert the user with the obtained companyId
  const insertUserResult = await executeQuery(insertUserQuery, [
    userData.first_name,
    userData.last_name,
    userData.email,
    hasedPassword,
    userData.contact,
    companyId,
  ]);
  const user_id = insertUserResult.insertId;
  // console.log(user_id)

  const findUserResult = await executeQuery(findUserQuery, [user_id]);

  const user = findUserResult[0];

  sendToken(req, user, 201, res);
});

//login user
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  const query =
    "SELECT u.id, u.first_name, u.last_name, u.email,u.password,u.status, u.contact, u.company_id, c.name AS company_name, r.role AS user_role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.email = ?";
  const result = await executeQuery(query, [email]);
  if (result.length === 0) {
    return next(new ErrorHandler("user not foud", 404));
  }
  const user = result[0];

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  // console.log("hello ", isPasswordMatched);
  if (isPasswordMatched === true) {
    sendToken(req,user, 200, res);
  } else {
    return next(new ErrorHandler("Email or Password is incorrect", 400));
  }
});

//logout

export const logout = (req, res) => {
  try {
    res.cookie("token_64977e", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).send({
      success: true,
      message: "Logged Out",
    });
    // res.status(200).json({
    //   success: true,
    //   message: "Logged Out",
    // });
  } catch (err) {
    return res.status(500).send({
      error: "Internal Server Error",
    });
    // return res.status(500).json({
    //   error: "Internal Server Error",
    // });
  }
};

// get single user
export const getUser = (req, res, next) => {
  try {
    const userId = req.params.id;
    // console.log(userId);
    const query =
      "SELECT u.id, u.first_name, u.last_name, u.email, u.contact,u.role_id, u.company_id, c.name AS company, r.role AS role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.id = ?";
    connection.query(query, [userId], (err, result) => {
      if (err) {
        return res.status(400).send({ err });
      
      }
      if (result.length <= 0) {
        return res.status(404).send({
          message: "user not found",
        });
      
      }
      const user = result[0];
      return res.status(200).send({
        success: true,
        user,
      });
      // return res.status(200).json({
      //   success: true,
      //   user,
      // });
    });
  } catch (error) {
    res.status(500).send({
      message: `Internal server error: ${error}`,
    });
    // res.status(500).json({
    //   message: `Internal server error: ${error}`,
    // });
  }
};

//get users from same company
export const getUsers = (req, res) => {
  try {
    const { company_id } = req.user;
    // console.log(companyId)
    const query =
      "SELECT u.id, u.first_name,u.status, u.last_name, u.email, u.contact, u.company_id, c.name AS company_name, r.role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.company_id = ?;";
    connection.query(query, [company_id], (err, result) => {
      if (err) {
        return res.status(400).send({ err });
        // return res.status(400).json({ err });
      }
      if (result.length === 0) {
        return res.status(404).send({
          message: "Company not found",
        });
        // return res.status(404).json({
        //   message: "Company not found",
        // });
      }
      const members = result;
      return res.status(200).send({
        success: true,
        members,
      });
      // return res.status(200).json({
      //   success: true,
      //   members,
      // });
    });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
    });
    // return res.status(500).json({
    //   message: "Internal Server Error",
    // });
  }
};

// update members

export const updateTeamMember = async (req, res) => {
  const { userId } = req.params;
  const { updatedData } = req.body;

  try {
    const { first_name, last_name, email, role_id, company_id } = updatedData;
    let updateQuery = "UPDATE users SET ";

    const updateFields = [];
    const updateValues = [];

    if (first_name) {
      updateFields.push("first_name = ?");
      updateValues.push(first_name);
    }

    if (last_name) {
      updateFields.push("last_name = ?");
      updateValues.push(last_name);
    }

    if (email) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (role_id) {
      updateFields.push("role_id = ?");
      updateValues.push(role_id);
    }

    if (company_id) {
      updateFields.push("company_id = ?");
      updateValues.push(company_id);
    }

    updateQuery += updateFields.join(", ") + " WHERE id = ?";
    updateValues.push(userId);

    await executeQuery(updateQuery, updateValues);

    // Optionally, fetch the updated team member data and return it
    const selectQuery = "SELECT * FROM users WHERE id = ?";
    const result = await executeQuery(selectQuery, [userId]);
    if (result.length <= 0) {
      return res.status(404).send({
        message: "User not found",
      });
      // return res.status(404).json({
      //   message: "User not found",
      // });
    }
    const updatedTeamMember = result[0];

    return res.status(202).send({
      success: true,
      updatedTeamMember,
    });
    // return res.status(202).json({
    //   success: true,
    //   updatedTeamMember,
    // });
  } catch (error) {
    throw new Error(`Failed to update team member: ${error.message}`);
  }
};

// delete team members
export const deleteTeamMember = (req, res) => {
  try {
    const { selectedUsers } = req.body;
    console.log(selectedUsers);
    const query = "delete from users where id = ?";
    for (let i = 0; i < selectedUsers.length; i++) {
      connection.query(query, [selectedUsers[i]], (err, result) => {
        if (err) {
          console.log("error in delete team member");
        }
      });
    }

    res.status(200).json({
      message: "Team members deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: `internal server error ${error}`,
    });
    // res.status(500).json({
    //   message: "internal server error",
    // });
  }
};

//get my profile
export const getMyProfile = async (req, res) => {
  try {
    console.log(req.user);
    const { id } = req.user;
    const query =
      "SELECT u.id, u.first_name, u.last_name, u.email,u.password, u.contact, u.company_id, c.name AS company_name, r.role AS user_role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.id = ?";

    const profileResult = await executeQuery(query, [id]);
    if (profileResult.length === 0) {
      return res.status(404).send({
        message: "User not found",
      });
      // return res.status(404).json({
      //   message: "User not found",
      // });
    }
    const user = profileResult[0];
    return res.status(200).send({
      success: true,
      user,
    });
    // return res.status(200).json({
    //   success: true,
    //   user,
    // });
  } catch (error) {}
};

// send invitation email
export const sendInvitationEmail = async (req, res) => {
  try {
    const { user } = req;
    const { userData } = req.body;

    const length = 8;
    const characters = "0123456789";
    let invitationToken = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      invitationToken += characters.charAt(randomIndex);
    }

    console.log(userData, user, invitationToken);

    sendMail(userData.email, user, invitationToken);

    const insertUserQuery =
      "INSERT INTO users (`first_name`,`last_name`,`email`, `company_id`) VALUES (?, ?, ?, ?)";
    const insertUserValues = [
      userData.fname,
      userData.lname,
      userData.email,
      user.company_id,
    ];

    const insertUserResult = await executeQuery(
      insertUserQuery,
      insertUserValues
    );
    const insertedUserId = insertUserResult.insertId;

    res.status(200).json({
      message: "Invitation email sent successfully",
      insertedUserId,
    });
  } catch (error) {
    res.status(500).json({
      message: `internal server error ${error.message}`,
    });
    // res.status(500).json({
    //   message: `internal server error ${error.message}`
    // });
  }
};

// invitation action
export const invitationAction = async (req, res) => {
  try {
    const { invitationToken } = req.params;
    const { action } = req.body;
    console.log(req.body, invitationToken);
    if (action === "accepted") {
      const query = "UPDATE users SET status = ? WHERE invitation_token = ?";

      const result = await executeQuery(query, ["active", invitationToken]);

      res.status(200).json({
        message: action,
        result,
      });
    } else if (action === "declined") {
      const query = "UPDATE users SET status = ? WHERE invitation_token = ?";

      const result = await executeQuery(query, ["declined", invitationToken]);

      res.status(200).json({
        message: action,
      });
    }
  } catch (error) {}
};

export const getCompanyProfile = catchAsyncErrors(async (req, res, next) => {

  const { company_id } = req.user;
  console.log(req.user)
  const query ="SELECT u.first_name, u.last_name, u.email, u.contact, r.role AS role_name, c.id, c.name AS company_name, c.email AS company_email, ba.address AS billing_address, ba.address2 AS billing_address2, ba.city AS billing_city, ba.state AS billing_state, ba.country AS billing_country, ba.postal_code AS billing_postal_code, c.industry_id, i.name AS industry_name FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id LEFT JOIN billing_address ba ON c.id = ba.company_id LEFT JOIN industries i ON c.industry_id = i.id WHERE c.id = ?";

 // const query = "SELECT u.first_name, u.last_name, u.email,u.contact, r.role AS role_name, c.id, c.name AS company_name, c.email AS company_email, ba.address AS billing_address,  ba.address2 AS billing_address2, ba.city AS billing_city, ba.state AS billing_state, ba.country AS billing_country ,ba.postal_code AS billing_postal_code FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id LEFT JOIN billing_address ba ON c.id = ba.company_id WHERE c.id = ?;"


  const result = await executeQuery(query,[company_id]);

  console.log(result.length);

  if (result.length === 0) {
    return next(new ErrorHandler("Company Not Found", 404));
    
  }

  const company = result[0];
  return res.status(200).json({
    success: true,
    company,
  });
});

export const updateCompany = catchAsyncErrors(async (req,res,next) => {
  const {company_id} = req.user

  const {company_name,contact,address,city,state,zipCode,country,industry} = req.body.companyDetails
  console.log(req.body.companyDetails)

  // const industyName = await executeQuery('SELECT * FROM industries WHERE name = ?',[industry]);

  // console.log("industry name",industyName)

  // let indutryId;

  // if(industyName.length === 0){

  //   const insertquery = await executeQuery('INSERT INTO industries(name) VALUES(?)',[industry]);
  //   indutryId = insertquery[0].id

  // }

  // indutryId = industyName[0].id

  const query = "UPDATE users u JOIN companies c ON u.company_id = c.id LEFT JOIN billing_address ba ON c.id = ba.company_id SET u.contact = ? ,c.name = ? ,ba.address = ?,ba.city = ?,ba.state = ?, ba.country = ? ,ba.postal_code = ? WHERE c.id = ?;"


  const result = await executeQuery(query,[contact,company_name,address,city,state,country,zipCode,company_id]);

  if(result.length === 0 ){
    return next(new ErrorHandler('Problem In Update Company'))
  }

  return res.status(200).json({
    success :true,
    message : 'Company updated successfully'
  })

})
