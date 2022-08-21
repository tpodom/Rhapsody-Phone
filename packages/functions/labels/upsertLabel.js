const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const { findLabelByName, upsertLabel } = require("../lib/db/labels");
const { generateId } = require("../lib/generator");

exports.upsertLabel = functions.https.onCall(
  async ({ labelId, name, color, icon, deleted = false }, { auth }) => {
    validateIsAdmin(auth?.token);

    name = (name || "").trim();

    if (!name) {
      throw new functions.https.HttpsError("invalid-argument", "You must specify a label name.");
    }

    icon = (icon || "").trim();

    if (!icon) {
      throw new functions.https.HttpsError("invalid-argument", "You must specify a label icon.");
    }

    color = (color || "").trim();

    if (!color) {
      throw new functions.https.HttpsError("invalid-argument", "You must specify a label color.");
    }

    if (!labelId) {
      const existingLabel = await findLabelByName(name);

      if (existingLabel) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          `"You must specify a unique label name. The name ${name} is already used."`,
        );
      }

      labelId = generateId();
    }

    const labelData = {
      id: labelId,
      name,
      color,
      icon,
      deleted,
    };

    logger.info(`"Upserting label ${name}"`, { data: labelData });

    try {
      const result = await upsertLabel(labelData);
      return result.data();
    } catch (error) {
      logger.error(error);
      throw new functions.https.HttpsError(
        "internal",
        "An internal error occurred. If the problem persists, please contact support.",
      );
    }
  },
);
