import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNAD } from './namibianTax.js'

const NAVY = [15, 37, 87]
const GOLD = [212, 168, 67]
const CREAM = [250, 246, 239]

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Download an array of row-objects as a CSV file (opens in Excel). */
export function downloadCSV(rows, filename) {
  if (!rows.length) { triggerDownload(new Blob([''], { type: 'text/csv' }), filename); return }
  const headers = Object.keys(rows[0])
  const esc = v => {
    const s = v === null || v === undefined ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n')
  triggerDownload(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), filename)
}

/**
 * Generate and download a professional payslip PDF.
 * @param {object} p - the calc result from calculatePayroll
 * @param {object} employee
 * @param {string} period
 * @param {object} company - COMPANY_INFO
 */
export function downloadPayslipPDF(p, employee, period, company) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const M = 40
  const [month, year] = period.split(' ')

  // Header band
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, W, 96, 'F')
  doc.setFillColor(...GOLD)
  doc.roundedRect(M, 30, 34, 34, 6, 6, 'F')
  doc.setTextColor(...NAVY); doc.setFont('helvetica', 'bold'); doc.setFontSize(20)
  doc.text('P', M + 17, 53, { align: 'center' })
  doc.setTextColor(255, 255, 255); doc.setFontSize(16)
  doc.text('PayFuta', M + 46, 46)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 210, 230)
  doc.text(company.name, M + 46, 60)
  doc.text(company.address, M + 46, 72)
  // Right side
  doc.setTextColor(...GOLD); doc.setFont('helvetica', 'bold'); doc.setFontSize(15)
  doc.text('PAYSLIP', W - M, 42, { align: 'right' })
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`${month} ${year}`, W - M, 58, { align: 'right' })
  doc.setFontSize(8); doc.setTextColor(200, 210, 230)
  doc.text(`Pay Date: 25 ${period}`, W - M, 72, { align: 'right' })

  // Employee info band
  doc.setFillColor(...CREAM)
  doc.rect(0, 96, W, 56, 'F')
  const infoY = 116
  const col = (x, label, val, sub) => {
    doc.setFontSize(7); doc.setTextColor(120, 130, 150); doc.text(label.toUpperCase(), x, infoY)
    doc.setFontSize(10); doc.setTextColor(...NAVY); doc.setFont('helvetica', 'bold')
    doc.text(String(val), x, infoY + 13)
    if (sub) { doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(110, 120, 140); doc.text(String(sub), x, infoY + 25) }
    doc.setFont('helvetica', 'normal')
  }
  col(M, 'Employee', `${employee.firstName} ${employee.lastName}`, employee.jobTitle)
  col(W / 2 - 40, 'Employee No.', employee.id, `Tax: ${employee.taxNumber}`)
  col(W - M - 130, 'Department', employee.department, `SSC: ${employee.sscNumber || '—'}`)

  // Earnings + deductions tables
  const earnings = [
    ['Basic Salary', formatNAD(p.basicSalary)],
    p.allowances > 0 && ['Allowances', formatNAD(p.allowances)],
    p.housingAllowance > 0 && ['Housing Allowance', formatNAD(p.housingAllowance)],
    p.overtimePay > 0 && ['Overtime', formatNAD(p.overtimePay)],
  ].filter(Boolean)
  const deductions = [
    ['PAYE', formatNAD(p.paye)],
    ['SSC (Employee)', formatNAD(p.sscEmployee)],
    p.pensionEmployee > 0 && ['Pension Fund', formatNAD(p.pensionEmployee)],
    p.medicalAid > 0 && ['Medical Aid', formatNAD(p.medicalAid)],
    p.otherDeductions > 0 && ['Other Deductions', formatNAD(p.otherDeductions)],
  ].filter(Boolean)

  autoTable(doc, {
    startY: 168,
    margin: { left: M, right: W / 2 + 8 },
    head: [['Earnings', '']],
    body: [...earnings, [{ content: 'Gross Salary', styles: { fontStyle: 'bold' } }, { content: formatNAD(p.grossSalary), styles: { fontStyle: 'bold' } }]],
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [40, 50, 80] },
    columnStyles: { 1: { halign: 'right' } },
  })
  autoTable(doc, {
    startY: 168,
    margin: { left: W / 2 + 8, right: M },
    head: [['Deductions', '']],
    body: [...deductions, [{ content: 'Total Deductions', styles: { fontStyle: 'bold' } }, { content: formatNAD(p.totalDeductions), styles: { fontStyle: 'bold', textColor: [200, 50, 50] } }]],
    theme: 'grid',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [40, 50, 80] },
    columnStyles: { 1: { halign: 'right', textColor: [200, 50, 50] } },
  })

  // Net pay band
  const netY = doc.lastAutoTable.finalY + 20
  doc.setFillColor(...NAVY)
  doc.roundedRect(M, netY, W - 2 * M, 44, 6, 6, 'F')
  doc.setTextColor(200, 210, 230); doc.setFontSize(9)
  doc.text('NET PAY', M + 16, netY + 20)
  doc.setTextColor(180, 190, 210); doc.setFontSize(7)
  doc.text(`Credited to account ending ...${String(employee.accountNumber || '').slice(-4)}`, M + 16, netY + 33)
  doc.setTextColor(...GOLD); doc.setFont('helvetica', 'bold'); doc.setFontSize(20)
  doc.text(formatNAD(p.netPay), W - M - 16, netY + 28, { align: 'right' })

  // Income perspectives
  if (p.incomeStreams) {
    autoTable(doc, {
      startY: netY + 60,
      margin: { left: M, right: M },
      head: [['Income Perspective', 'Code', 'Amount']],
      body: Object.values(p.incomeStreams).map(s => [s.label, s.code, formatNAD(s.value)]),
      theme: 'striped',
      headStyles: { fillColor: [230, 224, 210], textColor: NAVY, fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [60, 70, 90] },
      columnStyles: { 2: { halign: 'right' } },
    })
  }

  // Footer
  const fy = doc.internal.pageSize.getHeight() - 30
  doc.setDrawColor(220, 210, 195); doc.line(M, fy, W - M, fy)
  doc.setTextColor(130, 140, 160); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
  doc.text('Generated by PayFuta - Labour Act 11 of 2007 compliant - PAYE per Income Tax Act (Act 24 of 1981), 2026/2027 tables', M, fy + 12)
  doc.text('Confidential', W - M, fy + 12, { align: 'right' })

  doc.save(`Payslip_${employee.firstName}_${employee.lastName}_${period.replace(' ', '_')}.pdf`)
}

/**
 * Generic tabular report PDF.
 * @param {string} title
 * @param {string[]} columns
 * @param {Array<Array>} rows
 * @param {object} meta - { subtitle, company }
 */
export function downloadReportPDF(title, columns, rows, meta = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: columns.length > 6 ? 'landscape' : 'portrait' })
  const W = doc.internal.pageSize.getWidth()
  const M = 40
  doc.setFillColor(...NAVY); doc.rect(0, 0, W, 60, 'F')
  doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(14)
  doc.text(title, M, 30)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(200, 210, 230)
  doc.text(`${meta.company || 'PayFuta'}${meta.subtitle ? '  -  ' + meta.subtitle : ''}`, M, 46)
  autoTable(doc, {
    startY: 76,
    margin: { left: M, right: M },
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: NAVY, textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: [40, 50, 80] },
    alternateRowStyles: { fillColor: [250, 246, 239] },
  })
  doc.save(`${title.replace(/[^a-z0-9]+/gi, '_')}.pdf`)
}

export { triggerDownload }
