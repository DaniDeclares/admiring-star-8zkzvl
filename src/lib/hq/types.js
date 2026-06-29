/**
 * PROJECT HQ UNIVERSAL OBJECT SHAPE REFERENCE
 *
 * Plain JavaScript typedefs for normalized dashboard records. This file is
 * documentation-only and protects dashboard components from raw table shapes.
 */

/**
 * @typedef {Object} HqLead
 * @property {string|number} id
 * @property {string|null} contactName
 * @property {string|null} companyName
 * @property {string|null} phone
 * @property {string|null} email
 * @property {string|null} sourceText
 * @property {string|null} status
 * @property {string|null} notes
 * @property {string|null} dateCreated
 */

/**
 * @typedef {Object} HqRequest
 * @property {string|number} id
 * @property {string|number|null} leadId
 * @property {string|number|null} divisionId
 * @property {string|null} serviceType
 * @property {string|null} targetPropertyAddress
 * @property {string|null} clientRequestedTimeline
 * @property {string|null} financialEnvelope
 * @property {string|null} scopeDescription
 * @property {string|null} requestStatus
 * @property {string|null} executionPriority
 * @property {string|null} dateReceived
 */

/**
 * @typedef {Object} HqQuote
 * @property {string|number} id
 * @property {string|number|null} requestId
 * @property {string|number|null} divisionId
 * @property {string|null} internalIdentifier
 * @property {number} baseRevenueAmount
 * @property {string|null} quoteStatus
 * @property {string|null} dateCreated
 */

/**
 * @typedef {Object} HqJob
 * @property {string|number} id
 * @property {string|number|null} quoteId
 * @property {string|null} internalIdentifier
 * @property {string|null} scheduledExecutionDate
 * @property {string|null} jobStatus
 * @property {string|Array|null} assignedPersonnel
 * @property {number} completedTasks
 * @property {number} totalTasks
 */

/**
 * @typedef {Object} HqInvoice
 * @property {string|number} id
 * @property {string|number|null} jobId
 * @property {string|null} internalIdentifier
 * @property {number} rawSubtotal
 * @property {number} calculatedTax
 * @property {number} totalAmountDue
 * @property {string|null} invoiceStatus
 * @property {string|null} ledgerEntryDate
 */

export {};
