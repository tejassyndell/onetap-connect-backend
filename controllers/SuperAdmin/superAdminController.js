const connection = require("../../db/db");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors");
const ErrorHandler = require("../../utils/errorHandler");
const bcrypt = require("bcryptjs");
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
exports.getAllRoles = catchAsyncErrors(async (req, res, next) => {
  const query = "SELECT * FROM roles";
  connection.query(query, (err, result) => {
    if (err) {
      return next(new ErrorHandler(err.message, 500));
    }
    const roles = result;
    res.status(200).json({
      success: true,
      roles,
    });
  });
});
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const query =
    "SELECT u.id, u.first_name, u.last_name, u.email, c.name AS company_name, r.role AS role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id;";
  connection.query(query, (err, result) => {
    if (err) {
      return next(new ErrorHandler(err.message, 500));
    }
    if (result <= 0) {
      return next(new ErrorHandler("users not found", 404));
    }
    const users = result;
    return res.status(200).json({
      success: true,
      users,
    });
  });
});
// get all companies
exports.getAllCompanies = catchAsyncErrors(async (req, res, next) => {
  const query =
    "SELECT c.name AS company_name, c.email AS company_email, COUNT(u.id) AS total_team_members, ba.address,ba.address2, ba.city, ba.state,ba.country, ba.postal_code FROM companies c LEFT JOIN users u ON c.id = u.company_id LEFT JOIN billing_address ba ON c.id = ba.company_id GROUP BY c.id;";
  connection.query(query, (err, result) => {
    if (err) {
      return next(new ErrorHandler(err, 500));
    }
    if (result.length <= 0) {
      return next(new ErrorHandler("No ompanies found", 404));
    }
    const companies = result;
    return res.status(200).json({
      success: true,
      companies,
    });
  });
});
//get single user
exports.getSingleUserDetails = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const query =
    "SELECT u.id, u.first_name, u.last_name, u.email,u.status, u.contact,u.role_id, u.company_id, c.name AS company_name, r.role AS user_role FROM users u JOIN companies c ON u.company_id = c.id JOIN roles r ON u.role_id = r.id WHERE u.id = ?";
  const result = await executeQuery(query, [userId]);
  if (result.length === 0) {
    return next(new ErrorHandler(`User not Found with id ${userId}`, 404));
  }
  const user = result[0];
  return res.status(200).json({
    user: user,
    success: true,
  });
});
// delete user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const query = "DELETE from users WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      return next(new ErrorHandler(err, 500));
    }
    if (result.affectedRows === 0) {
      return next(new ErrorHandler(`User does not exist with Id: ${id}`, 400));
    }
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  });
});
// update user
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;
  const { updatedData } = req.body;
  const { first_name, last_name, email, role_id } = updatedData;
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
    if (role_id === 1) {
      updateValues.push(1);
    }
    if (role_id === 2) {
      updateValues.push(2);
    }
    if (role_id === 6) {
      updateValues.push(6);
    }
  }
  updateQuery += updateFields.join(", ") + " WHERE id = ?";
  updateValues.push(userId);
  await executeQuery(updateQuery, updateValues);
  // Optionally, fetch the updated team member data and return it
  const selectQuery = "SELECT * FROM users WHERE id = ?";
  const result = await executeQuery(selectQuery, [userId]);
  if (result.length <= 0) {
    return next(new ErrorHandler("User not found", 404));
  }
  const updatedTeamMember = result[0];
  return res.status(202).json({
    success: true,
    updatedTeamMember,
  });
});
// update permissions
exports.updatePermissions = catchAsyncErrors(async (req, res, naxt) => {
  const { id, permissions } = req.body;
  const query = "DELETE FROM permissions WHERE role_id = ?";
  const result = await executeQuery(query, [id]);
  connection.query(
    "ALTER TABLE permissions AUTO_INCREMENT=1;",
    (err, respone) => {
      if (err) {
        return next(ErrorHandler(err, 500));
      }
    }
  );
  // Insert new permissions for user
  permissions.forEach(async (permission) => {
    const query =
      "INSERT INTO permissions(`permission_name`,`role_id`) VALUES(?,?)";
    const result = await executeQuery(query, [
      permission.permission_name,
      permission.role_id,
    ]);
  });
  res.status(200).send({ message: "Permissions updated successfully" });
});
exports.getRolePermissions = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  const query = "SELECT * FROM permissions WHERE role_id = ?";
  const result = await executeQuery(query, [id]);
  if (result.length === 0) {
    return next(new ErrorHandler("Not Found", 404));
  }
  const permissions = result;
  res.status(200).json({
    permissions,
  });
});
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  const { company_id } = req.user;
  const { userdata } = req.body;
  query =
    "INSERT INTO users(first_name, last_name, email,role_id,company_id,password) VALUES(?, ?, ?, ?, ?, ?)";
  const hasedPassword = await bcrypt.hash(userdata.password, 10);
  const result = executeQuery(query, [userdata.first_name, userdata.last_name, userdata.email, userdata.role_id, company_id, hasedPassword]);
  if (result.length === 0) {
    return next(new ErrorHandler('User Not created', 400))
  }
  res.status(200).json({
    success: true,
    message: 'User created successfully'
  })
});
