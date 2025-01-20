import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
//import axios from 'axios';
import { PASSWORD_REQUIRED } from "@/config/index";
import db from "@/libs/database/mongoose/mongooseConnect";
import User from "@/libs/database/mongoose/models/user/user";
import { validateEmail, verifyPassword } from "@/libs/utils/formvalidate";
import { createStripeAccount } from "@/libs/actions/stripe.actions";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validation des champs requis
    if (!name || !email || !email.includes("@") || !password) {
      return NextResponse.json({ error: true, message: "Validation error" });
    }

    // Vérification que l'email ne contient pas de '+'
    if (email.includes("+")) {
      return NextResponse.json({
        error: true,
        message: "L'email ne peut pas contenir de '+'.",
      });
    }

    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      return NextResponse.json({
        error: true,
        message: "L'email n'est pas valide.",
      });
    }

    const [isValidPassword] = verifyPassword(password, PASSWORD_REQUIRED);
    if (!isValidPassword) {
      return NextResponse.json({
        error: true,
        message: "Le mot de passe ne remplit pas les conditions de sécurité.",
      });
    }

    await db();

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return NextResponse.json({
        error: true,
        message: "User exists already!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Création d'un nouveau compte Stripe pour l'utilisateur avec l'email
    const account = await createStripeAccount(email);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
      integrations: {
        stripe: {
          accountId: account.id,
        },
      },
    });

    const user = await newUser.save();

    //await axios.post(`${process.env.NEXTDOMAIN_URL}/api/mailer`, {
    //    emailType: 'VERIFY_MAIL',
    //    user: {
    //        email: user.email
    //    }
    //})

    return NextResponse.json(
      {
        message: "Created user !",
        ...user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("erreur", "catch error");
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}