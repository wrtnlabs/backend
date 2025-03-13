import nodemailer from "nodemailer";
import { Singleton } from "tstl";

import { HubGlobal } from "../../../HubGlobal";

export namespace HubEmailProvider {
  export const send = async (props: {
    to: string;
    subject: string;
    text: string;
  }) => {
    await mailer.get().sendMail({
      from: HubGlobal.env.GMAIL_USER,
      to: props.to,
      subject: props.subject,
      text: props.text,
    });
  };
}

const mailer = new Singleton(() => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: HubGlobal.env.GMAIL_USER,
      pass: HubGlobal.env.GMAIL_APP_SECRET,
    },
  });

  return transporter;
});
