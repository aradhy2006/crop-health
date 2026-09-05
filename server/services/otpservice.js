const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const OTP = require("../models/otp");

class OTPService {

    async generateOTP(mobile) {
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

        const otpHash = await bcrypt.hash(otp, 10);

        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );

        await OTP.deleteMany({ mobile });

        await OTP.create({
            mobile,
            otpHash,
            expiresAt
        });

        // Development only
        console.log(`OTP for ${mobile}: ${otp}`);

        return {
            success: true,
            message: "OTP sent successfully"
        };
    }

    async verifyOTP(mobile, otp) {
        const otpRecord = await OTP.findOne({ mobile });

        if (!otpRecord) {
            throw new Error(
                "OTP not found. Please request a new OTP."
            );
        }

        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({
                _id: otpRecord._id
            });

            throw new Error(
                "OTP expired. Please request a new OTP."
            );
        }

        if (otpRecord.attempts >= 5) {
            await OTP.deleteOne({
                _id: otpRecord._id
            });

            throw new Error(
                "Too many attempts. Please request a new OTP."
            );
        }

        const valid = await bcrypt.compare(
            otp,
            otpRecord.otpHash
        );

        if (!valid) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            throw new Error("Invalid OTP");
        }

        await OTP.deleteOne({
            _id: otpRecord._id
        });

        return {
            success: true,
            message: "OTP verified successfully"
        };
    }
}

module.exports = new OTPService();