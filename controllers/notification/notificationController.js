const ErrorHandler = require("../../utils/errorHandler.js");
const catchAsyncErrors = require("../../middleware/catchAsyncErrors.js");
const dotenv = require("dotenv");
const axios = require("axios");
const admin = require('firebase-admin');//firebase
const UserInformation = require("../../models/NewSchemas/users_informationModel.js");
const serviceAccount = require('../notification/onetapconnect-85196-firebase-adminsdk-d6ogv-3805b3b9d6.json');
const Notification = require('../../models/NewSchemas/Notification_model.js');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// const socketIO = require('../../app.js');

exports.save_Firebase_Token = catchAsyncErrors(async (req, res, next) => {
    const { firebase_token } = req.body;
    const { id } = req.user;
    console.log(firebase_token, "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(id, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

    try {
        // Find the user with the provided user_id
        const user = await UserInformation.findOne({ user_id: id });
        // console.log(user, "++++++++++++++++++++++++++++++++++++++++++++++++++++++")

        // Check if the user is found
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Retrieve the existing firebase_token array
        const user_exisiting_token = (user.firebase_token && user.firebase_token.map(token => token.value)) || [];
        console.log(user_exisiting_token, "##################################")

        // Compare firebase_token with each existing token

        if (user_exisiting_token === null || user_exisiting_token.length === 0) {
            await UserInformation.findOneAndUpdate(
                { user_id: id },
                { $set: { firebase_token: [{ value: firebase_token }] } }
            );
            console.log('Updated user with new token:');
            return res.status(200).json({ success: true, message: 'Firebase token added' });
        } else {
            const isTokenMatch = user_exisiting_token.some(existingToken => existingToken === firebase_token);
            if (isTokenMatch) {
                console.log('Same values:');
                return res.status(400).json({ success: false, message: 'Firebase token already exists' });
            } else {
                console.log('Different values:');
                await UserInformation.findOneAndUpdate(
                    { user_id: id },
                    { $addToSet: { firebase_token: { value: firebase_token } } }
                );
                console.log('Updated user with newwwwwwwwwwwwwwww token:');
            }
        }
    } catch (error) {
        console.log("ffffffffffffffffffffffffffffffailed")
    }
});

exports.getUsers_info = catchAsyncErrors(async (req, res, next) => {
    const { compID } = req.body;
    console.log(compID, "{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
    const users = await UserInformation.find({ company_ID: compID });
    console.log(users, "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6")

    if (!users) {
        return next(new ErrorHandler("No userinfo details Found", 404));
    }

    res.status(200).json({
        success: true,
        users,
    });
});

exports.get_firebase_token = catchAsyncErrors(async (req, res, next) => {
    const { firebaseTokens, notificationData, reciptantID } = req.body;
    console.log(firebaseTokens, notificationData, reciptantID, "================================================")

    if (!firebaseTokens || !Array.isArray(firebaseTokens) || firebaseTokens.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty firebaseTokens' });
    }

    try {
        // Call the sendPushNotification function with the received parameters
        const res_return = await sendPushNotification(firebaseTokens, notificationData);
        await storeNotification(notificationData.title, notificationData.body, reciptantID);
        res.status(200).json({ success: true, message: 'Push notification sent successfully' });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ success: false, message: 'Failed to send notification' });
    }
});
const sendPushNotification = async (tokens, notificationData) => {
    console.log(tokens, "{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
    try {
        const response = await admin.messaging().sendMulticast({
            tokens: tokens,
            notification: {
                title: notificationData.title,
                body: notificationData.body,
            },
        });

        console.log('Successfully sent notification:', response);
        return response;  // If you need to handle the response in the calling function
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;  // Rethrow the error for the calling function to handle
    }
};
const storeNotification = async (title, body, recipientIDs) => {
    console.log(recipientIDs, "{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
    try {
        for (const recipientID of recipientIDs) {
            const actualRecipientID = recipientID;
            console.log(actualRecipientID, "((((((((((((((((((((((((((((((((((((((((((")

            const notification = await Notification.create({
                userId: actualRecipientID,
                title: title,
                body: body,
            });
            await notification.save();
        }
        console.log('Notifications stored successfully.');
    } catch (error) {
        console.error('Error storing notifications:', error);
    }
};

exports.getmessages = catchAsyncErrors(async (req, res, next) => {
    const userId = req.user.id;
    console.log(`userid ${userId}`);

    try {
        const notify = await Notification.find({ userId });

        if (!notify || notify.length === 0) {
            return next(new ErrorHandler("User not found", 404));
        }
        res.status(200).json({
            success: true,
            notify,
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        next(new ErrorHandler("Internal Server Error", 500));
    }
});

exports.setnotifystatus = catchAsyncErrors(async (req, res, next) => {
    const { notificationId, status } = req.body;
    console.log(notificationId, status, "////////////////////////////////////")

    try {
        // Assuming you have a Notification model

        if (status === 'delete') {
            console.log('calld')
            const notification = await Notification.findByIdAndDelete({ _id: notificationId });
            // await notification.remove();
            if (!notification) {
                return res.status(404).json({ message: "Notification not found" });
            }
            return res.status(200).json({ success: true, message: 'Notification deleted successfully' });
        } else {
            // If status is 'archive' or 'seen', update the status
            const notification = await Notification.findById({ _id: notificationId });

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            notification.status = status;
            await notification.save();
            return res.status(200).json({ success: true, message: 'Notification status updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

exports.deleteallNotify = catchAsyncErrors(async (req, res, next) => {
    const { notificationIds } = req.body;
    console.log(notificationIds, "///////////////////////////////////////")
    
    try{
        for (const notificationId of notificationIds) {
            const notification = await Notification.findByIdAndDelete({ _id: notificationId });

            if (!notification) {
                return res.status(404).json({ message: `Notification with ID ${notificationId} not found` });
            }
        }
        return res.status(200).json({ success: true, message: 'Notifications deleted successfully' });
    }catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log(error)
    }
});