/**
 * Canonical operational task templates.
 *
 * These records describe execution work only. They intentionally contain no
 * prices, discounts, tax, travel, materials, or invoice arithmetic.
 *
 * The database migration seeds only generic channel templates. Service-specific
 * templates can be added after the canonical service IDs are confirmed in the
 * commercial catalog.
 */
export const FIELD_TASK_TEMPLATES = Object.freeze([
  {
    key: 'B2C_STANDARD_INTAKE_VERIFY',
    channelType: 'B2C',
    taskType: 'INTAKE_VERIFY',
    taskName: 'Verify booked scope and access instructions',
    required: true,
    evidenceRequired: false,
    sortOrder: 10,
  },
  {
    key: 'B2B_PROPERTY_ACCESS_VERIFY',
    channelType: 'B2B-APT',
    taskType: 'PROPERTY_ACCESS_VERIFY',
    taskName: 'Verify property access, unit readiness, and site instructions',
    required: true,
    evidenceRequired: true,
    sortOrder: 10,
  },
  {
    key: 'B2B_PROPERTY_SCOPE_DOCUMENT',
    channelType: 'B2B-APT',
    taskType: 'SCOPE_DOCUMENTATION',
    taskName: 'Document field condition against approved work scope',
    required: true,
    evidenceRequired: true,
    sortOrder: 20,
  },
  {
    key: 'B2B_RE_PROPERTY_SCOPE_VERIFY',
    channelType: 'B2B-RE',
    taskType: 'PROPERTY_SCOPE_VERIFY',
    taskName: 'Verify property preparation scope and access instructions',
    required: true,
    evidenceRequired: true,
    sortOrder: 10,
  },
  {
    key: 'B2G_SITE_REQUIREMENTS_VERIFY',
    channelType: 'B2G',
    taskType: 'SITE_REQUIREMENTS_VERIFY',
    taskName: 'Verify site-specific statement-of-work requirements before execution',
    required: true,
    evidenceRequired: true,
    sortOrder: 10,
  },
  {
    key: 'B2G_COMPLETION_DOCUMENTATION',
    channelType: 'B2G',
    taskType: 'COMPLETION_DOCUMENTATION',
    taskName: 'Capture required completion documentation for the task order',
    required: true,
    evidenceRequired: true,
    sortOrder: 20,
  },
]);

export function toTaskTemplateRows(templates = FIELD_TASK_TEMPLATES) {
  return templates.map((template) => ({
    templateKey: template.key,
    channelType: template.channelType,
    taskType: template.taskType,
    taskName: template.taskName,
    isRequired: template.required,
    evidenceRequired: template.evidenceRequired,
    sortOrder: template.sortOrder,
  }));
}
