const { logger } = require("../lib/init");
const functions = require("firebase-functions");
const { validateIsAdmin } = require("../lib/auth");
const { getLabel, upsertLabel } = require("../lib/db/labels");

exports.deleteLabel = functions.https.onCall(async ({ labelId }, { auth }) => {
  validateIsAdmin(auth?.token);

  const label = await getLabel(labelId);

  if (!label) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      `"The specified label ${labelId} does not exist."`,
    );
  }

  const labelData = {
    ...label.data(),
    deleted: true,
  };

  logger.info(`"Deleting label ${label.name}"`, { data: labelData });

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
});
