const PDFDocument = require('pdfkit');

// Calculate amount based on number of events
const calculateAmount = (eventsCount) => {
  if (eventsCount === 1) return 50;
  if (eventsCount === 2) return 80;
  if (eventsCount >= 3) return 120;
  return 0;
};

const generateParticipationCertificate = (userData, eventsData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Add background and styling
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9fa');

      // Header
      doc.fillColor('#2c3e50')
         .fontSize(24)
         .text('Technovaganza 2025', 50, 50, { align: 'center' });
      
      doc.fillColor('#e74c3c')
         .fontSize(18)
         .text('SRMS Institutions', 50, 80, { align: 'center' });

      // Participant Details
      doc.fillColor('#2c3e50')
         .fontSize(16)
         .text('PARTICIPATION CERTIFICATE', 50, 130, { align: 'center' });

      doc.moveTo(50, 160)
         .lineTo(550, 160)
         .strokeColor('#e74c3c')
         .stroke();

      // User Details
      doc.fillColor('#34495e')
         .fontSize(12)
         .text(`Participant ID: ${userData.pid}`, 50, 180)
         .text(`Name: ${userData.name}`, 50, 200)
         .text(`Roll No: ${userData.rollno}`, 50, 220)
         .text(`Branch: ${userData.branch}`, 50, 240)
         .text(`College: ${userData.college}`, 50, 260);

      // Calculate and display amount
      const eventsCount = eventsData.length;
      const amount = calculateAmount(eventsCount);
      
      doc.fillColor('#27ae60') // Green color for amount
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(`Total Events Registered: ${eventsCount}`, 50, 290)
         .text(`Amount to be Paid: ₹${amount}`, 50, 310);

      // Reset color for events section
      doc.fillColor('#34495e');

      // Registered Events
      let yPosition = 350;
      doc.fillColor('#2c3e50')
         .fontSize(14)
         .text('Registered Events:', 50, yPosition);

      yPosition += 30;
      eventsData.forEach((event, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fillColor('#34495e')
           .fontSize(10)
           .text(`${index + 1}. ${event.name} (${event.type}) - ${event.teamId ? `Team: ${event.teamId}` : 'Solo'}`, 70, yPosition);
        
        yPosition += 20;
      });

      // Payment Information Box
      const paymentY = Math.max(yPosition + 20, 650);
      doc.rect(50, paymentY, 500, 80)
         .fill('#fff3cd') // Light yellow background
         .stroke('#ffc107'); // Yellow border

      doc.fillColor('#856404') // Dark yellow text
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('PAYMENT INFORMATION', 300, paymentY + 15, { align: 'center' });
      
      doc.fontSize(9)
         .font('Helvetica')
         .text('Please pay the registration fees at Technovaganza Registration Counter', 300, paymentY + 30, { align: 'center' })
         .text('Location: Main Registration Desk, SRMS CET & R', 300, paymentY + 42, { align: 'center' })
         .text('Timing: 8:00 AM - 9:30 AM (sharp)', 300, paymentY + 54, { align: 'center' })
         .text('Bring this certificate for verification', 300, paymentY + 66, { align: 'center' });

      // Footer
      doc.y = 750;
      doc.fillColor('#7f8c8d')
         .fontSize(10)
         .text('Generated on: ' + new Date().toLocaleDateString(), 50, doc.y, { align: 'center' });

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateParticipationCertificate, calculateAmount };