import AuditLog from "../models/AuditLog.js";

const createAuditLog = async ({
  performedBy,
  action,
  resourceType,
  resourceId,
  description,
  ipAddress = null,
}) => {
  try {
    await AuditLog.create({
      performedBy,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress,
    });
  } catch (error) {
    console.error(
      "Failed to create audit log:",
      error.message
    );
  }
};

export default createAuditLog;