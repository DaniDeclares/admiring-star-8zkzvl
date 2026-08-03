const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, phone, category, serviceType, details } = req.body || {};

    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Missing required contact parameters (Name and Email or Phone)' });
    }

    // 1. Create or update Lead record
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        category: category || 'GENERAL_INTAKE',
      },
    });

    // 2. Create ServiceRequest tied to Lead
    const request = await prisma.serviceRequest.create({
      data: {
        leadId: lead.id,
        serviceType: serviceType || category || 'GENERAL',
        details: details || 'Intake request submitted via web form.',
        status: 'NEW',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Intake request received and persisted successfully.',
      trackingId: request.publicId,
      requestId: request.id,
    });
  } catch (error) {
    console.error('Intake Webhook Persistence Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  } finally {
    await prisma.$disconnect();
  }
};
