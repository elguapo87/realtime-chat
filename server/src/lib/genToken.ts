import jwt from "jsonwebtoken";

export const genToken = (userId: string) => {
    const secretKey = process.env.SECRET_KEY as string;
    if (!secretKey) throw new Error("secretKey is missing or not defined in dotenv file");

    const token = jwt.sign({ userId }, secretKey);

    return token;
};