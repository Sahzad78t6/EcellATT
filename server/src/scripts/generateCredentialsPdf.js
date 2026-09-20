import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { TEAM_MEMBERS } from './setupTeamMembers.js';
import { PDF_RECORDS } from './importPdfMembers.js';

const OUTPUT_PATH = path.resolve('..', 'ECELL_PORTAL_CREDENTIALS.pdf');

function createPdf() {
  console.log('📄 Generating Official Credentials PDF...');

  const doc = new PDFDocument({
    size: 'A4',
    margin: 36,
    bufferPages: true,
    info: {
      Title: 'E-Cell Attendance Portal - Official Credentials Directory',
      Author: 'E-Cell Admin'
    }
  });

  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  const colors = {
    primary: '#4338ca', // Indigo
    primaryDark: '#312e81',
    headerBg: '#4f46e5',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    rowEven: '#f8fafc',
    rowOdd: '#ffffff',
    highlight: '#dbeafe',
    badgeAdmin: '#ef4444',
    badgeLead: '#0d9488',
    badgeSec: '#3b82f6'
  };

  // Helper: Header on each page
  function drawPageHeader(title = 'E-CELL ATTENDANCE PORTAL — CREDENTIALS DIRECTORY') {
    doc.rect(36, 36, 523, 30).fill(colors.primary);
    doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold')
      .text(title, 46, 45, { width: 503, align: 'center' });
    doc.fillColor(colors.textMain);
  }

  // Cover / Header on First Page
  doc.rect(36, 36, 523, 70).fill(colors.primaryDark);
  doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
    .text('E-CELL STUDENT ATTENDANCE PORTAL', 46, 48, { align: 'center' });
  doc.fontSize(11).font('Helvetica')
    .text('Official User Credentials Directory (Academic Session 2024-2025)', 46, 72, { align: 'center' });
  doc.fontSize(8).font('Helvetica')
    .text(`Total Accounts: ${1 + TEAM_MEMBERS.length + PDF_RECORDS.length} | Generated: ${new Date().toLocaleDateString()}`, 46, 88, { align: 'center' });

  let y = 120;

  // Overview Note Box
  doc.rect(36, y, 523, 50).fillAndStroke('#f1f5f9', colors.border);
  doc.fillColor(colors.textMain).fontSize(9).font('Helvetica-Bold')
    .text('LOGIN RULES & PORTAL URL:', 46, y + 8);
  doc.font('Helvetica').fontSize(8).fillColor(colors.textMuted)
    .text('• Portal Login URL: http://localhost:5173 (or production domain)', 46, y + 22)
    .text('• Admin & Vertical Heads: Password = Password@123 (or Admin@12345 for Super Admin)', 46, y + 32)
    .text('• Student Members: Password = <RegistrationNumber>_ecell (e.g., 251FK01021_ecell)', 46, y + 42);

  y += 65;

  // ================= SECTION 1: CORE LEADERSHIP & ADMINS =================
  doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
    .text('1. Super Admin & Core Representatives (Admin Portal Access)', 36, y);
  y += 18;

  // Table Headers
  const adminCols = [
    { label: 'Role', x: 40, w: 70 },
    { label: 'Name', x: 110, w: 100 },
    { label: 'Designation / Vertical', x: 210, w: 120 },
    { label: 'Login Email', x: 330, w: 130 },
    { label: 'Password', x: 460, w: 90 }
  ];

  doc.rect(36, y, 523, 18).fill(colors.headerBg);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  adminCols.forEach(col => {
    doc.text(col.label, col.x, y + 5, { width: col.w });
  });
  y += 18;

  const adminRows = [
    { role: 'ADMIN', name: 'Super Admin', desig: 'System Administrator', email: 'admin@ecell.org', pass: 'Admin@12345' },
    { role: 'ADMIN', name: 'Nikhilesh', desig: 'Team Representative', email: 'nikhilesh@ecell.org', pass: 'Password@123' },
    { role: 'ADMIN', name: 'B. Rakesh', desig: 'Vice Team Representative', email: 'rakesh.b@ecell.org', pass: 'Password@123' },
    { role: 'ADMIN', name: 'Sri Latha', desig: 'Vice Team Representative', email: 'srilatha@ecell.org', pass: 'Password@123' },
    { role: 'ADMIN', name: 'Vasanta', desig: 'Resource & Counselling Lead', email: 'vasanta@ecell.org', pass: 'Password@123' }
  ];

  adminRows.forEach((row, i) => {
    const bg = i % 2 === 0 ? colors.rowEven : colors.rowOdd;
    doc.rect(36, y, 523, 16).fill(bg);
    doc.fillColor(colors.textMain).fontSize(7.5).font('Helvetica');
    doc.text(row.role, adminCols[0].x, y + 4, { width: adminCols[0].w });
    doc.text(row.name, adminCols[1].x, y + 4, { width: adminCols[1].w });
    doc.text(row.desig, adminCols[2].x, y + 4, { width: adminCols[2].w });
    doc.text(row.email, adminCols[3].x, y + 4, { width: adminCols[3].w });
    doc.font('Helvetica-Bold').text(row.pass, adminCols[4].x, y + 4, { width: adminCols[4].w });
    y += 16;
  });

  y += 15;

  // ================= SECTION 2: VERTICAL HEADS =================
  doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
    .text('2. Vertical Heads & Secretaries (Head Portal Access)', 36, y);
  y += 18;

  const headCols = [
    { label: 'Vertical', x: 40, w: 100 },
    { label: 'Role', x: 140, w: 65 },
    { label: 'Name', x: 205, w: 105 },
    { label: 'Login Email', x: 310, w: 130 },
    { label: 'Phone', x: 440, w: 55 },
    { label: 'Password', x: 495, w: 60 }
  ];

  doc.rect(36, y, 523, 18).fill(colors.headerBg);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
  headCols.forEach(col => {
    doc.text(col.label, col.x, y + 5, { width: col.w });
  });
  y += 18;

  const headMembers = TEAM_MEMBERS.filter(m => m.verticalSlug);

  headMembers.forEach((m, i) => {
    const bg = i % 2 === 0 ? colors.rowEven : colors.rowOdd;
    doc.rect(36, y, 523, 15).fill(bg);
    doc.fillColor(colors.textMain).fontSize(7).font('Helvetica');

    const vertName = m.designation.split(' ')[0] + ' ' + (m.designation.split(' ')[1] || '');
    doc.text(vertName, headCols[0].x, y + 4, { width: headCols[0].w });
    doc.text(m.role, headCols[1].x, y + 4, { width: headCols[1].w });
    doc.text(m.name, headCols[2].x, y + 4, { width: headCols[2].w });
    doc.text(m.email, headCols[3].x, y + 4, { width: headCols[3].w });
    doc.text(m.phone, headCols[4].x, y + 4, { width: headCols[4].w });
    doc.font('Helvetica-Bold').text('Password@123', headCols[5].x, y + 4, { width: headCols[5].w });
    y += 15;
  });

  // ================= SECTION 3: ALL 183 STUDENT MEMBERS =================
  doc.addPage();
  drawPageHeader('3. STUDENT MEMBERS DIRECTORY (183 REGISTERED STUDENTS)');

  y = 75;

  const memCols = [
    { label: 'ID', x: 40, w: 45 },
    { label: 'Name', x: 85, w: 100 },
    { label: 'Reg. No', x: 185, w: 60 },
    { label: 'Branch/Yr', x: 245, w: 60 },
    { label: 'Vertical', x: 305, w: 85 },
    { label: 'Login Email', x: 390, w: 105 },
    { label: 'Password', x: 495, w: 60 }
  ];

  function drawMemHeader() {
    doc.rect(36, y, 523, 16).fill(colors.headerBg);
    doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
    memCols.forEach(col => {
      doc.text(col.label, col.x, y + 4, { width: col.w });
    });
    y += 16;
  }

  drawMemHeader();

  let seqNum = 1;
  PDF_RECORDS.forEach((rec, idx) => {
    if (y > 770) {
      doc.addPage();
      drawPageHeader('3. STUDENT MEMBERS DIRECTORY (CONTINUED)');
      y = 75;
      drawMemHeader();
    }

    const memberId = `ECELL_${String(seqNum).padStart(3, '0')}`;
    const password = `${rec.regNo.trim()}_ecell`;
    seqNum++;

    const bg = idx % 2 === 0 ? colors.rowEven : colors.rowOdd;
    doc.rect(36, y, 523, 13.5).fill(bg);
    doc.fillColor(colors.textMain).fontSize(6.5).font('Helvetica');

    doc.text(memberId, memCols[0].x, y + 3.5, { width: memCols[0].w });
    doc.text(rec.name.substring(0, 22), memCols[1].x, y + 3.5, { width: memCols[1].w });
    doc.text(rec.regNo, memCols[2].x, y + 3.5, { width: memCols[2].w });
    doc.text(`${rec.branch.substring(0, 7)}/${rec.year}`, memCols[3].x, y + 3.5, { width: memCols[3].w });
    doc.text(rec.vertical ? rec.vertical.substring(0, 18) : 'General', memCols[4].x, y + 3.5, { width: memCols[4].w });
    doc.text(rec.email.substring(0, 22), memCols[5].x, y + 3.5, { width: memCols[5].w });
    doc.font('Helvetica-Bold').text(password, memCols[6].x, y + 3.5, { width: memCols[6].w });

    y += 13.5;
  });

  // Footer page numbers on all pages
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.fontSize(7).font('Helvetica').fillColor(colors.textMuted)
      .text(
        `E-Cell Student Attendance System — Page ${i + 1} of ${totalPages} — Confidential`,
        36,
        805,
        { width: 523, align: 'center' }
      );
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`✅ PDF successfully generated at: ${OUTPUT_PATH}`);
  });
}

createPdf();
