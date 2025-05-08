import path from 'path';
import config from 'config';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { readFileSync } from 'fs';

export const mailTransporter = nodemailer.createTransport({
  host: config.get('smtp.host'),
  port: config.get<number>('smtp.port'),
  secure: config.get<boolean>('smtp.secure'),
  auth: {
    user: config.get('smtp.auth.user'),
    pass: config.get('smtp.auth.pass'),
  },
});

export function loadMailTemplate(
  templateName: string,
  context: object,
): string {
  const rawTemplate = readFileSync(
    `${__dirname}/email-templates/${templateName}.hbs`,
  );
  const template = handlebars.compile(rawTemplate.toString());

  return template(context, {
    allowProtoPropertiesByDefault: true,
  });
}
