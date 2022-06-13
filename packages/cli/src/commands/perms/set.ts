import { Command, Flags } from "@oclif/core";
import admin from "firebase-admin";
import fs from "node:fs";

export default class SetPermissions extends Command {
  static description = "Adds a user's permissions.";

  static examples = [
    `$ rhasody-connect-cli perms set <user email> <perm>...
admin added to user@email.com.    
`,
  ];

  static flags = {
    key: Flags.string({
      char: "k",
      description: "Service account key file",
      required: false,
      default: `${process.env.HOME}/.rhapsody-connect/cli.json`,
    }),
    permission: Flags.string({
      char: "p",
      description: "Permission to set",
      required: false,
      multiple: true,
    }),
  };

  static args = [{ name: "email", description: "User email address", required: true }];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SetPermissions);

    if (!fs.existsSync(flags.key)) {
      throw new Error(`Unable to authenticate to Firebase, ${flags.key} file does not exist.`);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(flags.key, "utf8"));
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    const user = await app.auth().getUserByEmail(args.email);

    if (!user.emailVerified) {
      throw new Error(`Refusing to add permission to unverified user ${args.email}`);
    }

    const permissions: { [key: string]: boolean } = {};

    for (const perm of flags.permission) {
      permissions[perm] = true;
    }

    await app.auth().setCustomUserClaims(user.uid, permissions);

    await app.auth().getUserByEmail(args.email);
    this.log(`Configured ${args.email} with permissions ${flags.permission.join(", ")}`);
  }
}
